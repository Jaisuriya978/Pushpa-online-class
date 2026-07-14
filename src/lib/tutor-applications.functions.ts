import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submissionSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  qualification: z.string().trim().max(200).optional().nullable(),
  subjects: z.string().trim().max(500).optional().nullable(),
  experience: z.string().trim().max(3000).optional().nullable(),
  preferred_location: z.string().trim().max(200).optional().nullable(),
  availability: z.string().trim().max(500).optional().nullable(),
  resume_url: z.string().trim().url().max(1024).optional().nullable(),
});

export type TutorApplicationInput = z.infer<typeof submissionSchema>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAdminEmail(app: TutorApplicationInput & { id: string; created_at: string }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Full Name", app.full_name],
    ["Email", app.email],
    ["Phone", app.phone],
    ["Country", app.country],
    ["Qualification", app.qualification],
    ["Subjects", app.subjects],
    ["Preferred Location", app.preferred_location],
    ["Availability", app.availability],
    ["Experience", app.experience],
    ["Resume", app.resume_url],
    ["Submitted", app.created_at],
    ["Application ID", app.id],
  ];
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#0F172A;vertical-align:top">${escapeHtml(
          label,
        )}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#334155">${
          value ? escapeHtml(String(value)) : '<span style="color:#94a3b8">—</span>'
        }</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06)">
      <div style="background:#0F172A;color:#fff;padding:20px 24px">
        <h1 style="margin:0;font-size:20px">New Tutor Application</h1>
        <p style="margin:4px 0 0;color:#cbd5e1;font-size:13px">Pushpa Online Tuition</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${body}</table>
      <div style="padding:16px 24px;background:#F8FAFC;color:#64748b;font-size:12px">
        Reply directly to this email to reach the applicant.
      </div>
    </div></body></html>`;
}

async function sendAdminEmail(app: TutorApplicationInput & { id: string; created_at: string }) {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resendKey || !adminEmail) {
    console.error("Email not sent: missing credentials", {
      hasResend: !!resendKey,
      hasAdmin: !!adminEmail,
    });
    return { sent: false, reason: "missing_credentials" as const };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Pushpa Tutors <onboarding@resend.dev>",
        to: [adminEmail],
        reply_to: app.email,
        subject: `New Tutor Application - ${app.full_name}`,
        html: renderAdminEmail(app),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend send error", res.status, body);
      return { sent: false, reason: "gateway_error" as const };
    }
    return { sent: true };
  } catch (err) {
    console.error("Resend email failed", err);
    return { sent: false, reason: "network_error" as const };
  }
}

export const submitTutorApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    // Use the service-role client (bypasses RLS) instead of the public anon
    // client. The anon key insert was blocked at 42501 because .select()
    // after .insert() requires a SELECT policy too, and there was no public
    // SELECT policy on tutor_applications (intentionally — applicant PII
    // shouldn't be publicly readable). Since this runs server-side only and
    // the input is already validated by the zod schema above, it's safe to
    // use the trusted admin client here.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("tutor_applications")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone ?? null,
        country: data.country ?? null,
        qualification: data.qualification ?? null,
        subjects: data.subjects ?? null,
        experience: data.experience ?? null,
        preferred_location: data.preferred_location ?? null,
        availability: data.availability ?? null,
        resume_url: data.resume_url ?? null,
      })
      .select("id, created_at")
      .single();

    if (error || !inserted) {
      console.error("Insert tutor application failed", error);
      // Surface the REAL Supabase/Postgres error message (code + details)
      // instead of a generic one, so the actual cause is visible to the
      // person testing the form. This is deliberately verbose for
      // debugging; tighten it once the root cause is confirmed fixed.
      const detail = error
        ? `${error.message}${error.code ? ` (code: ${error.code})` : ""}${
            error.details ? ` — ${error.details}` : ""
          }${error.hint ? ` | hint: ${error.hint}` : ""}`
        : "insert returned no row";
      throw new Error(`Could not save your application: ${detail}`);
    }

    const emailResult = await sendAdminEmail({
      ...data,
      id: inserted.id,
      created_at: inserted.created_at,
    });

    return { ok: true as const, id: inserted.id, emailSent: emailResult.sent };
  });