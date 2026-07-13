import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  listApplications,
  updateApplicationStatus,
  getResumeSignedUrl,
  type ApplicationStatus,
} from "@/lib/admin-applications.functions";
import {
  listBookings,
  rescheduleBooking,
  cancelBooking,
  type BookingRow,
} from "@/lib/booking.functions";
import { Loader2, Download, LogOut, Search, FileText, Video, Calendar as CalendarIcon, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Pushpa Online Tuition" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  qualification: string | null;
  subjects: string | null;
  experience: string | null;
  preferred_location: string | null;
  availability: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"applications" | "meetings">("applications");
  const listFn = useServerFn(listApplications);
  const updateFn = useServerFn(updateApplicationStatus);
  const signFn = useServerFn(getResumeSignedUrl);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [selected, setSelected] = useState<Application | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => listFn(),
  });

  useEffect(() => {
    if (error) toast.error(error instanceof Error ? error.message : "Failed to load");
  }, [error]);

  const applications = (data?.applications ?? []) as Application[];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return [a.full_name, a.email, a.phone, a.country, a.subjects, a.qualification]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [applications, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: applications.length, pending: 0, approved: 0, rejected: 0 };
    for (const a of applications) c[a.status]++;
    return c;
  }, [applications]);

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; status: ApplicationStatus; admin_notes?: string | null }) =>
      updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Application updated");
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  async function handleDownloadResume(app: Application) {
    if (!app.resume_url) return;
    try {
      const { url } = await signFn({ data: { resume_url: app.resume_url } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open resume");
    }
  }

  function handleExportCsv() {
    const rows = filtered;
    const headers = [
      "id", "created_at", "status", "full_name", "email", "phone", "country",
      "qualification", "subjects", "preferred_location", "availability", "experience",
      "resume_url", "admin_notes",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => esc((r as any)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tutor-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage tutor applications and scheduled meetings.</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "applications" && <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            <Download className="size-4" /> Export CSV
          </button>}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-border p-1 bg-background">
        <button
          onClick={() => setTab("applications")}
          className={`px-4 py-2 text-sm font-semibold rounded-md ${tab === "applications" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Tutor Applications
        </button>
        <button
          onClick={() => setTab("meetings")}
          className={`px-4 py-2 text-sm font-semibold rounded-md ${tab === "meetings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Meetings
        </button>
      </div>

      {tab === "meetings" ? <MeetingsPanel /> : (
      <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as any)}
            className={`rounded-lg border p-4 text-left transition ${
              statusFilter === s ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-secondary/50"
            }`}
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s}</div>
            <div className="mt-1 text-2xl font-semibold">{counts[s as keyof typeof counts]}</div>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, subject…"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No applications match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3">Subjects</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <button className="font-medium text-left hover:underline" onClick={() => setSelected(a)}>
                        {a.full_name}
                      </button>
                      {a.country && <div className="text-xs text-muted-foreground">{a.country}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div>{a.email}</div>
                      {a.phone && <div className="text-xs text-muted-foreground">{a.phone}</div>}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{a.subjects ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(a)}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <DetailDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onDownloadResume={() => handleDownloadResume(selected)}
          onUpdate={(status, notes) =>
            updateMut.mutate(
              { id: selected.id, status, admin_notes: notes },
              {
                onSuccess: () => setSelected((s) => (s ? { ...s, status, admin_notes: notes ?? null } : s)),
              },
            )
          }
          saving={updateMut.isPending}
        />
      )}
      </>
      )}
    </div>
  );
}

/* ============================ MEETINGS PANEL ============================ */

function MeetingsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBookings);
  const rescheduleFn = useServerFn(rescheduleBooking);
  const cancelFn = useServerFn(cancelBooking);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all" | "cancelled">("upcoming");
  const [editing, setEditing] = useState<BookingRow | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => (listFn as () => Promise<{ bookings: BookingRow[] }>)(),
  });
  useEffect(() => { if (error) toast.error(error instanceof Error ? error.message : "Failed to load meetings"); }, [error]);

  const bookings = data?.bookings ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filter === "cancelled") return b.status === "cancelled";
      if (b.status === "cancelled") return false;
      if (filter === "upcoming") return b.meeting_date >= today;
      if (filter === "past") return b.meeting_date < today;
      return true;
    });
  }, [bookings, filter, today]);

  const cancelMut = useMutation({
    mutationFn: (id: string) => (cancelFn as (o: { data: { id: string } }) => Promise<{ ok: true }>)({ data: { id } }),
    onSuccess: () => { toast.success("Meeting cancelled"); qc.invalidateQueries({ queryKey: ["admin-bookings"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Cancel failed"),
  });

  const rescheduleMut = useMutation({
    mutationFn: (vars: { id: string; meeting_date: string; meeting_time: string }) =>
      (rescheduleFn as (o: { data: typeof vars }) => Promise<{ ok: true }>)({ data: vars }),
    onSuccess: () => {
      toast.success("Rescheduled — new Meet link generated");
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Reschedule failed"),
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["upcoming", "past", "all", "cancelled"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-secondary/50"
            }`}
          >{k}</button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No meetings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3">Type / Plan</th>
                  <th className="text-left px-4 py-3">Date & Time</th>
                  <th className="text-left px-4 py-3">Meet</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-secondary/30 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.student_name}</div>
                      {b.parent_name && <div className="text-xs text-muted-foreground">Parent: {b.parent_name}</div>}
                      {(b.curriculum || b.grade) && <div className="text-xs text-muted-foreground">{[b.grade, b.curriculum].filter(Boolean).join(" · ")}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{b.email}</div>
                      {b.phone && <div className="text-muted-foreground">{b.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${b.booking_type === "demo" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}`}>
                        {b.booking_type === "demo" ? "Demo" : "Paid"}
                      </span>
                      {b.plan_name && <div className="text-xs text-muted-foreground mt-1">{b.plan_name}</div>}
                      {b.plan_amount != null && <div className="text-xs font-semibold">£{Number(b.plan_amount).toLocaleString()}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <div className="font-medium text-foreground">{b.meeting_date}</div>
                      <div className="text-muted-foreground">{b.meeting_time} {b.timezone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {b.meet_link ? (
                        <a href={b.meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium">
                          <Video className="size-3.5" /> Join
                        </a>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                        b.status === "scheduled" ? "bg-amber-100 text-amber-800 border-amber-200" :
                        b.status === "completed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        "bg-rose-100 text-rose-800 border-rose-200"
                      }`}>{b.status}</span>
                      {b.payment_status && <div className="text-[10px] mt-1 text-muted-foreground">Pay: {b.payment_status}</div>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {b.status !== "cancelled" && (
                        <>
                          <button
                            onClick={() => setEditing(b)}
                            className="text-primary hover:underline text-xs font-medium mr-3"
                          >
                            <CalendarIcon className="size-3.5 inline -mt-0.5" /> Reschedule
                          </button>
                          <button
                            onClick={() => { if (confirm(`Cancel meeting with ${b.student_name}?`)) cancelMut.mutate(b.id); }}
                            className="text-rose-600 hover:underline text-xs font-medium"
                          >
                            <XCircle className="size-3.5 inline -mt-0.5" /> Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <RescheduleModal
          booking={editing}
          onClose={() => setEditing(null)}
          onSubmit={(date, time) => rescheduleMut.mutate({ id: editing.id, meeting_date: date, meeting_time: time })}
          saving={rescheduleMut.isPending}
        />
      )}
    </>
  );
}

function RescheduleModal({
  booking, onClose, onSubmit, saving,
}: {
  booking: BookingRow;
  onClose: () => void;
  onSubmit: (date: string, time: string) => void;
  saving: boolean;
}) {
  const [date, setDate] = useState(booking.meeting_date);
  const [time, setTime] = useState(booking.meeting_time);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
        <h3 className="font-serif text-xl font-semibold">Reschedule meeting</h3>
        <p className="text-sm text-muted-foreground mt-1">A new unique Google Meet link will be generated and the student will be notified by email.</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase">Time (HH:MM 24h)</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-input px-3 py-2 text-sm">Cancel</button>
          <button
            onClick={() => onSubmit(date, time)}
            disabled={saving}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save & regenerate Meet
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({
  app,
  onClose,
  onDownloadResume,
  onUpdate,
  saving,
}: {
  app: Application;
  onClose: () => void;
  onDownloadResume: () => void;
  onUpdate: (status: ApplicationStatus, notes: string | null) => void;
  saving: boolean;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [notes, setNotes] = useState(app.admin_notes ?? "");

  useEffect(() => {
    setStatus(app.status);
    setNotes(app.admin_notes ?? "");
  }, [app.id]);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-full max-w-lg bg-background border-l border-border overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold">{app.full_name}</h2>
              <p className="text-sm text-muted-foreground">{app.email}</p>
            </div>
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm">
            <Field label="Phone" value={app.phone} />
            <Field label="Country" value={app.country} />
            <Field label="Qualification" value={app.qualification} />
            <Field label="Subjects" value={app.subjects} />
            <Field label="Preferred Location" value={app.preferred_location} />
            <Field label="Availability" value={app.availability} />
            <Field label="Experience" value={app.experience} multiline />
            <Field label="Submitted" value={new Date(app.created_at).toLocaleString()} />
          </dl>

          {app.resume_url && (
            <button
              onClick={onDownloadResume}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              <FileText className="size-4" /> View Resume
            </button>
          )}

          <div className="pt-4 border-t border-border space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => onUpdate(status, notes.trim() ? notes : null)}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 text-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}>{value || "—"}</dd>
    </div>
  );
}