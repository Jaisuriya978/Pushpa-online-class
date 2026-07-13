import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CheckCircle2, Video, CalendarPlus, Home, Loader2, Copy } from "lucide-react";
import { getBookingById } from "@/lib/booking.functions";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

const searchSchema = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/booking-confirmed")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Booking Confirmed — Pushpa Online Tuition" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookingConfirmedPage,
});

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function BookingConfirmedPage() {
  const { id } = Route.useSearch();
  const getFn = useServerFn(getBookingById);
  const { data, isLoading, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => (getFn as (opts: { data: { id: string } }) => Promise<{ booking: any }>)({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F8FAFC]">
        <Loader2 className="size-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F8FAFC] p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold">Booking not found</h1>
          <p className="mt-2 text-slate-600">We couldn't find that booking.</p>
          <Link to="/" className="mt-4 inline-block text-[#2563EB] font-semibold hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const b = data.booking;
  const gcalUrl = buildAddToGoogleCalendarUrl(b);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section
        className="py-12 md:py-16 text-white"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
      >
        <div className="container-page text-center">
          <div className="mx-auto grid place-items-center size-16 rounded-full bg-white/20 backdrop-blur">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold">Booking Confirmed</h1>
          <p className="mt-2 text-white/90">Your {b.booking_type === "demo" ? "Demo Class" : "Class"} has been successfully scheduled.</p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14 max-w-2xl">
        <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 space-y-4">
            <Row label="Student" value={b.student_name} />
            <Row label="Date" value={new Date(b.meeting_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
            <Row label="Time" value={`${formatTime(b.meeting_time)} (${b.timezone})`} />
            <Row label="Duration" value={`${b.duration_minutes} minutes`} />
            {b.plan_name && <Row label="Plan" value={b.plan_name} />}
            {b.meet_link && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Google Meet Link</div>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <a href={b.meet_link} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] font-semibold hover:underline break-all">{b.meet_link}</a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(b.meet_link); toast.success("Copied"); }}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    <Copy className="size-3" /> Copy
                  </button>
                </div>
              </div>
            )}
            {b.google_event_id && (
              <Row label="Meeting ID" value={b.google_event_id.slice(0, 12) + "…"} />
            )}
          </div>

          <div className="p-6 md:p-8 pt-0 grid sm:grid-cols-3 gap-3">
            {b.meet_link && (
              <a
                href={b.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#1E40AF]"
              >
                <Video className="size-4" /> Join Meeting
              </a>
            )}

            <a
              href={buildWhatsAppShareUrl(b)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg"
    style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
  >
    <WhatsAppIcon className="size-4" /> Share on WhatsApp
  </a>


            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
            >
              <CalendarPlus className="size-4" /> Add to Calendar
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
            >
              <Home className="size-4" /> Back to Home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          A confirmation email with meeting instructions has been sent to <strong>{b.email}</strong>.
          You'll receive reminders 30 and 10 minutes before the class.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-[#0F172A] text-right">{value}</span>
    </div>
  );
}

function buildAddToGoogleCalendarUrl(b: {
  student_name: string;
  meeting_date: string;
  meeting_time: string;
  timezone: string;
  duration_minutes: number;
  meet_link?: string | null;
  booking_type: string;
}) {
  // Format YYYYMMDDTHHmmss without timezone conversion; include ctz for tz.
  const [y, mo, d] = b.meeting_date.split("-");
  const [h, mi] = b.meeting_time.split(":");
  const startLocal = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  const endLocal = new Date(startLocal.getTime() + b.duration_minutes * 60_000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${b.booking_type === "demo" ? "Demo Class" : "Class"} — ${b.student_name}`,
    dates: `${fmt(startLocal)}/${fmt(endLocal)}`,
    ctz: b.timezone,
    details: b.meet_link ? `Join: ${b.meet_link}` : "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildWhatsAppShareUrl(b: {
  student_name: string;
  meeting_date: string;
  meeting_time: string;
  timezone: string;
  duration_minutes: number;
  meet_link?: string | null;
  booking_type: string;
  plan_name?: string | null;
}) {
  const dateLabel = new Date(b.meeting_date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const label = b.booking_type === "demo" ? "Demo Class" : "Class";

  const lines = [
    "Pushpa Online Tuition",
    `Your ${label.toLowerCase()} is confirmed.`,
    "",
    `Student: ${b.student_name}`,
    `Date: ${dateLabel}`,
    `Time: ${formatTime(b.meeting_time)} (${b.timezone})`,
    `Duration: ${b.duration_minutes} minutes`,
    ...(b.plan_name ? [`Plan: ${b.plan_name}`] : []),
    "",
    ...(b.meet_link
      ? [`Join here: ${b.meet_link}`, ""]
      : []),
    "Please join 5 minutes before the class.",
    "",
    "Contact us: +91 89395 77588",
  ];

  const text = encodeURIComponent(lines.join("\n"));
  const phone = "918939577588";
  return `https://wa.me/${phone}?text=${text}`;
}