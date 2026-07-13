import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ============================================================================
 * Booking + Google Meet scheduling
 *   - Public: create a booking → creates a unique Google Meet via Google
 *     Calendar API (conferenceData.createRequest), stores meeting details,
 *     sends confirmation emails to student + tutor.
 *   - Public: get a single booking by id (for the confirmation page).
 *   - Public: list booked time slots for a date (to disable slots in the UI).
 *   - Admin: list all bookings, update (reschedule/cancel, regenerates Meet
 *     link on reschedule).
 *
 * Auth: uses a Google Cloud service account (JWT) directly against the
 * Google Calendar API — no Lovable connector gateway / LOVABLE_API_KEY
 * required. Configure these env vars / Supabase secrets:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY        (paste the private_key value from the service
 *                              account JSON exactly as-is, wrapped in double
 *                              quotes; \n sequences and surrounding quotes
 *                              are normalized defensively below)
 *   GOOGLE_CALENDAR_ID        (the calendar shared with the service account)
 *   RESEND_API_KEY            (optional — for confirmation emails)
 * ==========================================================================*/

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const RESEND_API = "https://api.resend.com";
const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DEFAULT_DURATION = 60;

/* ------------------------- Google service account auth ------------------------- */

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(input: string | ArrayBuffer): string {
  let str: string;
  if (typeof input === "string") {
    str = btoa(input);
  } else {
    const bytes = new Uint8Array(input);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    str = btoa(binary);
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Defensive normalization of a raw private key env value. Handles common
 * copy/paste mistakes: wrapping quotes, literal \n vs real newlines,
 * stray \r, and accidental double-escaping (\\n -> \n -> real newline). */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  // Strip a single pair of wrapping quotes if the whole value was quoted
  // literally (common when copy/pasting into a .env file or a dashboard
  // that doesn't strip quote characters).
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Collapse accidental double-escaping (\\n -> \n) before the real pass.
  key = key.replace(/\\\\n/g, "\\n");

  // Convert literal backslash-n sequences into real newlines.
  key = key.replace(/\\n/g, "\n");

  // Normalize CRLF / stray carriage returns.
  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  key = key.trim();

  if (!key.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY does not look like a PEM private key (missing 'BEGIN PRIVATE KEY' header). " +
        "Re-copy the private_key value from the service account JSON file — it should start with " +
        "-----BEGIN PRIVATE KEY----- and end with -----END PRIVATE KEY-----.",
    );
  }
  return key;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  if (!b64 || b64.length < 100) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY appears empty or truncated after cleanup — check the secret value was pasted in full.",
    );
  }

  let binary: string;
  try {
    binary = atob(b64);
  } catch (e) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY is not valid base64 after normalization — it may have been corrupted, " +
        "truncated, or double-escaped when set as an env var/secret. Re-copy it directly from the " +
        "service account JSON file's private_key field.",
    );
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getGoogleAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  console.log("GOOGLE_CALENDAR_ID present:", !!process.env.GOOGLE_CALENDAR_ID);
  console.log("GOOGLE_OAUTH_CLIENT_ID present:", !!clientId);

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials not configured");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Google token refresh failed [${res.status}]: ${text}`);
    throw new Error("Failed to authenticate with Google Calendar");
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

function calendarHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

function getCalendarId(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error("GOOGLE_CALENDAR_ID not configured");
  return id;
}

/** Convert wall-clock time in a timezone to a UTC ISO string. */
function localWallClockToUtc(dateStr: string, timeStr: string, tz: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const partsAt = (t: number) => {
    const parts: Record<string, string> = {};
    for (const p of fmt.formatToParts(new Date(t))) if (p.type !== "literal") parts[p.type] = p.value;
    return parts;
  };
  const p = partsAt(guess);
  const asUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour) % 24, Number(p.minute),
  );
  const offset = asUtc - guess;
  return new Date(guess - offset);
}

async function createGoogleMeetEvent(input: {
  bookingId: string;
  summary: string;
  description: string;
  dateStr: string;
  timeStr: string;
  timezone: string;
  durationMinutes: number;
  attendees: string[];
}) {
  const start = localWallClockToUtc(input.dateStr, input.timeStr, input.timezone);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);

  const body = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: start.toISOString(), timeZone: input.timezone },
    end: { dateTime: end.toISOString(), timeZone: input.timezone },
    attendees: input.attendees.filter(Boolean).map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 30 },
        { method: "popup", minutes: 10 },
      ],
    },
    conferenceData: {
      createRequest: {
        requestId: `pushpa-${input.bookingId}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const accessToken = await getGoogleAccessToken();
  const calendarId = getCalendarId();
  const url = `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
  const res = await fetch(url, {
    method: "POST",
    headers: calendarHeaders(accessToken),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Google Calendar create failed [${res.status}]: ${text}`);
    throw new Error(`Failed to create Google Meet event [${res.status}]`);
  }
  const data = (await res.json()) as {
    id: string;
    htmlLink?: string;
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: { uri?: string; entryPointType?: string }[];
      conferenceId?: string;
    };
  };
  const meetLink =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ||
    "";
  return { eventId: data.id, meetLink, htmlLink: data.htmlLink, startIso: start.toISOString() };
}

async function deleteGoogleEvent(eventId: string) {
  const accessToken = await getGoogleAccessToken();
  const calendarId = getCalendarId();
  const url = `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;
  const res = await fetch(url, { method: "DELETE", headers: calendarHeaders(accessToken) });
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const text = await res.text();
    console.error(`Google Calendar delete failed [${res.status}]: ${text}`);
  }
}

/* ------------------------------ Email (Resend direct) ------------------------------ */

async function sendEmail(input: { to: string; subject: string; html: string }) {
  const resendKey = process.env.RESEND_API_KEY;
  console.log("RESEND_API_KEY present:", !!resendKey, resendKey?.slice(0, 6));
  if (!resendKey) return; // silent skip if not configured
  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Pushpa Online Tuition <onboarding@resend.dev>",
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) console.error(`Resend send failed [${res.status}]:`, await res.text());
  } catch (e) {
    console.error("Resend send error", e);
  }
}

function meetingEmailHtml(opts: {
  greetingName: string;
  isTutor: boolean;
  student: string;
  dateStr: string;
  timeStr: string;
  timezone: string;
  meetLink: string;
  type: "demo" | "paid";
  plan?: string | null;
}) {
  const label = opts.type === "demo" ? "Demo Class" : "Class";
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0F172A">
    <h2 style="margin:0 0 12px;color:#1E3A8A">Your ${label} is Confirmed 🎉</h2>
    <p>Hi ${opts.greetingName},</p>
    <p>${opts.isTutor
      ? `A new ${label.toLowerCase()} has been scheduled with <strong>${opts.student}</strong>.`
      : `Your ${label.toLowerCase()} has been successfully scheduled.`}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#F8FAFC;border-radius:8px;overflow:hidden">
      <tr><td style="padding:10px 14px;color:#64748B">Date</td><td style="padding:10px 14px;font-weight:600">${opts.dateStr}</td></tr>
      <tr><td style="padding:10px 14px;color:#64748B">Time</td><td style="padding:10px 14px;font-weight:600">${opts.timeStr} (${opts.timezone})</td></tr>
      ${opts.plan ? `<tr><td style="padding:10px 14px;color:#64748B">Plan</td><td style="padding:10px 14px;font-weight:600">${opts.plan}</td></tr>` : ""}
    </table>
    <p style="margin:20px 0">
      <a href="${opts.meetLink}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">
        Join Google Meet
      </a>
    </p>
    <p style="color:#475569;font-size:14px">Please join 5 minutes before the scheduled time. You'll receive a reminder 30 minutes and 10 minutes before the class.</p>
    <p style="color:#94A3B8;font-size:12px;margin-top:24px">Pushpa Online Tuition · info@pushpaedu.com · +91 89395 77588</p>
  </div>`;
}

/* ============================ SCHEMAS ============================ */

const bookingInput = z.object({
  student_name: z.string().trim().min(1).max(200),
  parent_name: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(64).optional().nullable(),
  curriculum: z.string().trim().max(120).optional().nullable(),
  grade: z.string().trim().max(80).optional().nullable(),
  subject: z.string().trim().max(200).optional().nullable(),
  booking_type: z.enum(["demo", "paid"]),
  plan_name: z.string().trim().max(200).optional().nullable(),
  plan_duration: z.string().trim().max(80).optional().nullable(),
  plan_amount: z.number().nonnegative().optional().nullable(),
  payment_status: z.string().trim().max(40).optional().nullable(),
  meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meeting_time: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().max(64).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

/* ============================ SERVER FUNCTIONS ============================ */

/** Public: list booked slots for a given date (to disable in UI). */
export const listBookedSlotsForDate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("meeting_time")
      .eq("meeting_date", data.date)
      .eq("status", "scheduled");
    if (error) throw new Error(error.message);
    return { slots: (rows ?? []).map((r) => r.meeting_time as string) };
  });

/** Public: create a booking, create Google Meet event, email everyone. */
export const createBookingAndMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tz = data.timezone || DEFAULT_TIMEZONE;
    const tutorEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "";

    // 1. Prevent double-booking for the same date+time slot.
    const { data: existing, error: existErr } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("meeting_date", data.meeting_date)
      .eq("meeting_time", data.meeting_time)
      .eq("status", "scheduled")
      .maybeSingle();
    if (existErr) throw new Error(existErr.message);
    if (existing) throw new Error("That time slot is already booked. Please pick another.");

    // 2. Insert booking (scheduled, no meet link yet).
    const insertRow = {
      student_name: data.student_name,
      parent_name: data.parent_name ?? null,
      email: data.email,
      phone: data.phone ?? null,
      curriculum: data.curriculum ?? null,
      grade: data.grade ?? null,
      subject: data.subject ?? null,
      booking_type: data.booking_type,
      plan_name: data.plan_name ?? null,
      plan_duration: data.plan_duration ?? null,
      plan_amount: data.plan_amount ?? null,
      payment_status: data.payment_status ?? (data.booking_type === "paid" ? "paid" : null),
      meeting_date: data.meeting_date,
      meeting_time: data.meeting_time,
      timezone: tz,
      duration_minutes: DEFAULT_DURATION,
      tutor_email: tutorEmail || null,
      notes: data.notes ?? null,
      status: "scheduled" as const,
    };
    const { data: booking, error: insErr } = await supabaseAdmin
      .from("bookings")
      .insert(insertRow)
      .select("*")
      .single();
    if (insErr || !booking) throw new Error(insErr?.message ?? "Could not create booking");

    // 3. Google Meet auto-creation is disabled for now.
    //
    // A plain Google service account cannot generate Meet conference links
    // for a personal Gmail calendar (this requires Google Workspace +
    // domain-wide delegation, which isn't available here). Rather than
    // fail the whole booking over this, we simply skip Meet creation and
    // save the booking without a meet_link. Revisit this once either:
    //   (a) OAuth is set up against the real Gmail account, or
    //   (b) a fixed/manual Meet link is decided on.
    // 3. Create the Google Meet event via OAuth-authenticated Calendar API.
const summary =
  data.booking_type === "demo"
    ? `Demo Class — ${data.student_name}`
    : `Class — ${data.student_name}${data.plan_name ? ` (${data.plan_name})` : ""}`;

let meetLink = "";
let eventId = "";
try {
  const result = await createGoogleMeetEvent({
    bookingId: booking.id,
    summary,
    description: `Booking ID: ${booking.id}`,
    dateStr: data.meeting_date,
    timeStr: data.meeting_time,
    timezone: tz,
    durationMinutes: DEFAULT_DURATION,
    attendees: [data.email, tutorEmail].filter(Boolean) as string[],
  });
  meetLink = result.meetLink;
  eventId = result.eventId;

  await supabaseAdmin
    .from("bookings")
    .update({ google_event_id: eventId, meet_link: meetLink })
    .eq("id", booking.id);
} catch (e) {
  console.error("Meet creation failed for booking", booking.id, e);
  // booking still succeeds without a meet link rather than failing the whole request
}

    // 4. Emails (best effort).
    const displayTime = data.meeting_time;
    const commonHtml = (isTutor: boolean, name: string) =>
      meetingEmailHtml({
        greetingName: name,
        isTutor,
        student: data.student_name,
        dateStr: data.meeting_date,
        timeStr: displayTime,
        timezone: tz,
        meetLink,
        type: data.booking_type,
        plan: data.plan_name,
      });
    await Promise.all([
      sendEmail({
        to: data.email,
        subject:
          data.booking_type === "demo"
            ? "Your Demo Class is Confirmed — Pushpa Online Tuition"
            : "Your Class is Confirmed — Pushpa Online Tuition",
        html: commonHtml(false, data.parent_name || data.student_name),
      }),
      tutorEmail
        ? sendEmail({
            to: tutorEmail,
            subject: `New ${data.booking_type === "demo" ? "Demo" : "Paid"} Booking — ${data.student_name}`,
            html: commonHtml(true, "Tutor"),
          })
        : Promise.resolve(),
    ]);

    return {
      booking: {
        ...booking,
        google_event_id: eventId,
        meet_link: meetLink,
      },
    };
  });

/** Public: fetch a booking by id for the confirmation page. */
export const getBookingById = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, student_name, parent_name, email, phone, curriculum, grade, subject, booking_type, plan_name, plan_duration, plan_amount, payment_status, meeting_date, meeting_time, timezone, duration_minutes, google_event_id, meet_link, tutor_email, status, created_at",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Booking not found");
    return { booking: row };
  });

/* ------------------------------ ADMIN ------------------------------ */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden: admin access required");
}

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*")
      .order("meeting_date", { ascending: false })
      .order("meeting_time", { ascending: false });
    if (error) throw new Error(error.message);
    return { bookings: data ?? [] };
  });

export const rescheduleBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      meeting_time: z.string().regex(/^\d{2}:\d{2}$/),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .single();
    if (fetchErr || !booking) throw new Error(fetchErr?.message ?? "Booking not found");

    if (booking.google_event_id) {
      await deleteGoogleEvent(booking.google_event_id);
    }
    const tz = booking.timezone || DEFAULT_TIMEZONE;
    const summary =
      booking.booking_type === "demo"
        ? `Demo Class — ${booking.student_name}`
        : `Class — ${booking.student_name}${booking.plan_name ? ` (${booking.plan_name})` : ""}`;
    const result = await createGoogleMeetEvent({
      bookingId: booking.id,
      summary,
      description: `Rescheduled booking. ID: ${booking.id}`,
      dateStr: data.meeting_date,
      timeStr: data.meeting_time,
      timezone: tz,
      durationMinutes: booking.duration_minutes ?? DEFAULT_DURATION,
      attendees: [booking.email, booking.tutor_email].filter(Boolean) as string[],
    });

    const { error: upErr } = await supabaseAdmin
      .from("bookings")
      .update({
        meeting_date: data.meeting_date,
        meeting_time: data.meeting_time,
        google_event_id: result.eventId,
        meet_link: result.meetLink,
        status: "scheduled",
      })
      .eq("id", booking.id);
    if (upErr) throw new Error(upErr.message);

    await sendEmail({
      to: booking.email,
      subject: "Your class has been rescheduled — Pushpa Online Tuition",
      html: meetingEmailHtml({
        greetingName: booking.parent_name || booking.student_name,
        isTutor: false,
        student: booking.student_name,
        dateStr: data.meeting_date,
        timeStr: data.meeting_time,
        timezone: tz,
        meetLink: result.meetLink,
        type: booking.booking_type,
        plan: booking.plan_name,
      }),
    });

    return { ok: true as const, meet_link: result.meetLink };
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("google_event_id, email, student_name")
      .eq("id", data.id)
      .single();
    if (booking?.google_event_id) await deleteGoogleEvent(booking.google_event_id);
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    if (booking?.email) {
      await sendEmail({
        to: booking.email,
        subject: "Your class has been cancelled — Pushpa Online Tuition",
        html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <p>Hi ${booking.student_name},</p>
          <p>Your scheduled class has been cancelled. Please contact us to reschedule.</p>
          <p>— Pushpa Online Tuition</p>
        </div>`,
      });
    }
    return { ok: true as const };
  });

export type BookingRow = {
  id: string;
  student_name: string;
  parent_name: string | null;
  email: string;
  phone: string | null;
  curriculum: string | null;
  grade: string | null;
  subject: string | null;
  booking_type: "demo" | "paid";
  plan_name: string | null;
  plan_duration: string | null;
  plan_amount: number | null;
  payment_id: string | null;
  payment_status: string | null;
  meeting_date: string;
  meeting_time: string;
  timezone: string;
  duration_minutes: number;
  google_event_id: string | null;
  meet_link: string | null;
  tutor_email: string | null;
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at?: string;
};