import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon, Clock, ArrowLeft, Loader2, CheckCircle2, User2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createBookingAndMeeting,
  listBookedSlotsForDate,
} from "@/lib/booking.functions";

const searchSchema = z.object({
  type: z.enum(["demo", "paid"]).default("demo").optional(),
  student_name: z.string().optional(),
  parent_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  curriculum: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  plan_name: z.string().optional(),
  plan_duration: z.string().optional(),
  plan_amount: z.coerce.number().optional(),
});

export const Route = createFileRoute("/schedule")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Schedule Your Class — Pushpa Online Tuition" },
      { name: "description", content: "Pick your preferred date and time and we'll generate a unique Google Meet link for your session." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SchedulePage,
});

const WEEKDAY_SLOTS = ["16:00", "17:00", "18:00", "19:00"];
const WEEKEND_SLOTS = ["10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];

function formatSlot(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function SchedulePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const isPaid = search.type === "paid";

  const [studentInfo, setStudentInfo] = useState({
    student_name: search.student_name || "",
    parent_name: search.parent_name || "",
    email: search.email || "",
    phone: search.phone || "",
    curriculum: search.curriculum || "",
    grade: search.grade || "",
    subject: search.subject || "",
  });

  // Hydrate from sessionStorage if user came from contact form.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("pending-booking");
      if (raw) {
        const parsed = JSON.parse(raw);
        setStudentInfo((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [slot, setSlot] = useState<string | null>(null);

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const isWeekend = date ? [0, 6].includes(date.getDay()) : false;
  const slots = isWeekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;

  const bookedFn = useServerFn(listBookedSlotsForDate);
  const { data: bookedData } = useQuery({
    queryKey: ["booked-slots", dateStr],
    queryFn: () => bookedFn({ data: { date: dateStr } }),
    enabled: Boolean(dateStr),
  });
  const bookedSet = useMemo(() => new Set(bookedData?.slots ?? []), [bookedData]);

  const createFn = useServerFn(createBookingAndMeeting);
  const createMut = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      (createFn as (opts: { data: unknown }) => Promise<{ booking: { id: string } }>)({ data: payload }),
    onSuccess: (result) => {
      sessionStorage.removeItem("pending-booking");
      toast.success("Meeting scheduled! Redirecting…");
      navigate({ to: "/booking-confirmed", search: { id: result.booking.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not schedule"),
  });

  const missingInfo = !studentInfo.student_name.trim() || !studentInfo.email.trim();

  function handleConfirm() {
    if (missingInfo) {
      toast.error("Please fill in student name and email");
      return;
    }
    if (!date || !slot) {
      toast.error("Please pick a date and time slot");
      return;
    }
    createMut.mutate({
      student_name: studentInfo.student_name.trim(),
      parent_name: studentInfo.parent_name.trim() || null,
      email: studentInfo.email.trim(),
      phone: studentInfo.phone.trim() || null,
      curriculum: studentInfo.curriculum.trim() || null,
      grade: studentInfo.grade.trim() || null,
      subject: studentInfo.subject.trim() || null,
      booking_type: isPaid ? "paid" : "demo",
      plan_name: search.plan_name || null,
      plan_duration: search.plan_duration || null,
      plan_amount: typeof search.plan_amount === "number" ? search.plan_amount : null,
      payment_status: isPaid ? "paid" : null,
      meeting_date: dateStr,
      meeting_time: slot,
      timezone: "Asia/Kolkata",
    });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section
        className="relative overflow-hidden py-12 md:py-16 text-white"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)" }}
      >
        <div className="container-page">
          <Link to={isPaid ? "/payments" : "/contact"} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold">
            {isPaid ? "Schedule Your First Class" : "Schedule Your Demo Class"}
          </h1>
          <p className="mt-2 text-white/85 max-w-2xl">
            Choose your preferred date and time. We'll generate a unique Google Meet link and email it to you instantly.
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14 grid lg:grid-cols-3 gap-8">
        {/* Left: student summary + info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-4 text-white flex items-center gap-2">
              <User2 className="size-5" />
              <h2 className="font-bold">Student Details</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <InfoInput label="Student Name" value={studentInfo.student_name} onChange={(v) => setStudentInfo((s) => ({ ...s, student_name: v }))} required />
              <InfoInput label="Parent Name" value={studentInfo.parent_name} onChange={(v) => setStudentInfo((s) => ({ ...s, parent_name: v }))} />
              <InfoInput label="Email" type="email" value={studentInfo.email} onChange={(v) => setStudentInfo((s) => ({ ...s, email: v }))} required />
              <InfoInput label="Phone" value={studentInfo.phone} onChange={(v) => setStudentInfo((s) => ({ ...s, phone: v }))} />
              <InfoInput label="Curriculum" value={studentInfo.curriculum} onChange={(v) => setStudentInfo((s) => ({ ...s, curriculum: v }))} />
              <InfoInput label="Grade / Year" value={studentInfo.grade} onChange={(v) => setStudentInfo((s) => ({ ...s, grade: v }))} />
              <InfoInput label="Subject" value={studentInfo.subject} onChange={(v) => setStudentInfo((s) => ({ ...s, subject: v }))} />
            </div>
          </div>

          {isPaid && (
            <div className="rounded-3xl bg-white shadow-xl border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-white flex items-center gap-2">
                <BookOpen className="size-5" />
                <h2 className="font-bold">Your Plan</h2>
              </div>
              <ul className="p-5 space-y-2 text-sm">
                {search.plan_name && <li className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-semibold">{search.plan_name}</span></li>}
                {search.plan_duration && <li className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold">{search.plan_duration}</span></li>}
                {typeof search.plan_amount === "number" && <li className="flex justify-between"><span className="text-slate-500">Amount Paid</span><span className="font-bold text-emerald-600">£{search.plan_amount.toLocaleString()}</span></li>}
                <li className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold text-emerald-600">Successful ✓</span></li>
              </ul>
            </div>
          )}
        </div>

        {/* Right: date + slots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-6 py-4 text-white flex items-center gap-2">
              <CalendarIcon className="size-5" />
              <h2 className="font-bold">Choose a Date</h2>
            </div>
            <div className="p-5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full sm:w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {date ? format(date, "EEEE, MMMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setSlot(null); }}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] px-6 py-4 text-[#0F172A] flex items-center gap-2">
              <Clock className="size-5" />
              <h2 className="font-bold">Choose a Time Slot ({isWeekend ? "Weekend" : "Weekday"} · IST)</h2>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((s) => {
                const taken = bookedSet.has(s);
                const active = slot === s;
                return (
                  <button
                    key={s}
                    disabled={taken}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-3 text-sm font-bold transition",
                      taken
                        ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed line-through"
                        : active
                        ? "border-[#2563EB] bg-[#2563EB] text-white shadow-lg scale-[1.02]"
                        : "border-slate-200 bg-white text-[#0F172A] hover:border-[#2563EB] hover:bg-[#2563EB]/5",
                    )}
                  >
                    {formatSlot(s)}
                    {taken && <div className="text-[10px] font-normal mt-0.5">Booked</div>}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={createMut.isPending || !slot || !date || missingInfo}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-xl transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
          >
            {createMut.isPending ? (
              <><Loader2 className="size-5 animate-spin" /> Scheduling…</>
            ) : (
              <><CheckCircle2 className="size-5" /> Confirm & Schedule Meeting</>
            )}
          </button>
          <p className="text-center text-xs text-slate-500">
            A unique Google Meet link will be generated and emailed to you and your tutor.
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoInput({
  label, value, onChange, type = "text", required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
  );
}