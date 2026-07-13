import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, Globe, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Free Trial — Pushpa Online Tuition" },
      { name: "description", content: "Book a free trial class or get in touch with Pushpa Online Tuition. Phone +91 89395 77588, email info@pushpaedu.com." },
      { property: "og:title", content: "Contact Pushpa Online Tuition" },
      { property: "og:description", content: "Book a free trial class today." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="container-page py-16 md:py-24 grid lg:grid-cols-2 gap-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Get in touch</p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold">Book your free trial class today.</h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-md">Tell us about your child's learning goals and we'll arrange a demo session with a matched tutor.</p>
        <ul className="mt-8 space-y-4 text-foreground">
          <li className="flex items-center gap-3"><span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary"><Phone className="size-5" /></span><a href="tel:+918939577588">+91 89395 77588</a></li>
          <li className="flex items-center gap-3"><span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary"><Mail className="size-5" /></span><a href="mailto:info@pushpaedu.com">info@pushpaedu.com</a></li>
          <li className="flex items-center gap-3"><span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary"><Globe className="size-5" /></span>www.pushpaedu.com</li>
          <li className="flex items-center gap-3"><span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary"><Clock className="size-5" /></span>Monday – Saturday · 9:00 AM – 8:00 PM</li>
        </ul>
      </div>
      <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const payload = {
              student_name: String(fd.get("name") || "").trim(),
              parent_name: String(fd.get("name") || "").trim(),
              email: String(fd.get("email") || "").trim(),
              phone: String(fd.get("phone") || "").trim(),
              grade: String(fd.get("year") || "").trim(),
              curriculum: String(fd.get("curriculum") || "").trim(),
              subject: String(fd.get("subjects") || "").trim(),
            };
            if (!payload.student_name || !payload.email) return;
            setSubmitting(true);
            try {
              sessionStorage.setItem("pending-booking", JSON.stringify(payload));
            } catch {}
            navigate({
              to: "/schedule",
              search: {
                type: "demo",
                student_name: payload.student_name,
                email: payload.email,
                phone: payload.phone,
                grade: payload.grade,
                curriculum: payload.curriculum,
                subject: payload.subject,
              },
            });
          }}
          className="space-y-4"
        >
            <h2 className="font-serif text-2xl font-semibold">Request a free trial</h2>
            <Input label="Parent / Student Name" name="name" required />
            <Input label="Email" type="email" name="email" required />
            <Input label="Phone (with country code)" name="phone" />
            <Input label="Student's Year / Grade" name="year" />
            <Input label="Curriculum (UK, IGCSE, UAE, etc.)" name="curriculum" />
            <div>
              <label className="block text-sm font-medium text-foreground">Subjects of interest</label>
              <textarea name="subjects" rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              Request Demo Class <ArrowRight className="size-4" />
            </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}{required && <span className="text-accent"> *</span>}</label>
      <input type={type} name={name} required={required} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}