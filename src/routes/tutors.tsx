import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitTutorApplication } from "@/lib/tutor-applications.functions";
import tutorImg from "@/assets/tutor-teaching.jpg";

export const Route = createFileRoute("/tutors")({
  head: () => ({
    meta: [
      { title: "Become a Tutor — Pushpa Online Tuition" },
      { name: "description", content: "Join our global teaching team. Teach international students online from home with flexible hours and competitive earnings." },
      { property: "og:title", content: "Become an Online Tutor" },
      { property: "og:description", content: "Hiring online tutors for Maths, Sciences, English, Computer Science, Business and Economics." },
      { property: "og:url", content: "/tutors" },
    ],
    links: [{ rel: "canonical", href: "/tutors" }],
  }),
  component: TutorsPage,
});

const requirements = ["Bachelor's Degree or Higher", "Strong English Communication Skills", "Experience Teaching International Curricula", "Online Teaching Experience Preferred", "Subject Expertise", "Passion for Student Success"];
const subjects = ["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology", "Computer Science", "Business Studies", "Economics"];
const benefits = ["Flexible Working Hours", "Work From Home", "International Student Exposure", "Competitive Earnings", "Professional Growth Opportunities"];

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ACCEPTED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const formSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
  qualification: z.string().trim().max(200).optional(),
  subjects: z.string().trim().max(500).optional(),
  preferred_location: z.string().trim().max(200).optional(),
  availability: z.string().trim().max(500).optional(),
  experience: z.string().trim().max(3000).optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof formSchema>, string>>;

function TutorsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const submit = useServerFn(submitTutorApplication);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = formSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      let resumeUrl: string | undefined;
      if (resumeFile) {
        if (resumeFile.size > MAX_RESUME_BYTES) {
          toast.error("Resume must be 10 MB or smaller.");
          setSubmitting(false);
          return;
        }
        if (!ACCEPTED_RESUME_TYPES.has(resumeFile.type)) {
          toast.error("Resume must be a PDF, DOC, or DOCX file.");
          setSubmitting(false);
          return;
        }
        const ext = resumeFile.name.split(".").pop()?.toLowerCase() || "pdf";
        const safeName = parsed.data.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const path = `${safeName}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("tutor-resumes")
          .upload(path, resumeFile, { contentType: resumeFile.type, upsert: false });
        if (upErr) {
          console.error("Resume upload failed:", upErr);
          // Surface the REAL error instead of a generic message, so we can
          // see exactly what's wrong (missing bucket, RLS policy, etc.)
          toast.error(`Resume upload failed: ${upErr.message}`);
          setSubmitting(false);
          return;
        }
        resumeUrl = `supabase://tutor-resumes/${path}`;
      }

      await submit({
        data: {
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          country: parsed.data.country || null,
          qualification: parsed.data.qualification || null,
          subjects: parsed.data.subjects || null,
          experience: parsed.data.experience || null,
          preferred_location: parsed.data.preferred_location || null,
          availability: parsed.data.availability || null,
          resume_url: resumeUrl ?? null,
        },
      });
      toast.success("Application received. We'll be in touch within 3 working days.");
      setSubmitted(true);
    } catch (err) {
      console.error("Tutor application submission failed:", err);
      // Surface the REAL error message instead of a generic one. This is
      // temporary/debug-friendly; once the root cause is fixed this can be
      // reverted to a friendlier generic message if desired.
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again in a moment.";
      toast.error(message, { duration: 10000 });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <section className="container-page pt-16 pb-12 md:pt-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">We're hiring</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold">Join our global teaching team.</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl">Teach students from around the world from the comfort of your home. Flexible hours, international exposure and competitive earnings.</p>
          <a href="#apply" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Apply Now <ArrowRight className="size-4" />
          </a>
        </div>
        <img src={tutorImg} alt="Online tutor teaching from a home office" width={1400} height={1050} loading="lazy" className="rounded-3xl border border-border shadow-xl object-cover w-full h-[380px] lg:h-[480px]" />
      </section>

      <section className="container-page py-16 grid md:grid-cols-3 gap-5">
        {[
          { title: "Requirements", items: requirements },
          { title: "Subjects Required", items: subjects },
          { title: "Benefits", items: benefits },
        ].map((col) => (
          <div key={col.title} className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-serif text-xl font-semibold">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.items.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="size-4 text-primary mt-0.5" /> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="apply" className="container-page pb-24">
        <div className="rounded-3xl border border-border bg-secondary/40 p-8 md:p-12">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold">Apply now</h2>
          <p className="mt-2 text-muted-foreground">Fill in your details — our team will get back within 3 working days.</p>
          {submitted ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-foreground">Thank you! Your application has been received. We'll reach out at the email you provided.</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid md:grid-cols-2 gap-4" noValidate>
              <Field label="Full Name" name="full_name" required error={errors.full_name} />
              <Field label="Email" name="email" type="email" required error={errors.email} />
              <Field label="Phone" name="phone" error={errors.phone} />
              <Field label="Country" name="country" error={errors.country} />
              <Field label="Highest Qualification" name="qualification" error={errors.qualification} />
              <Field label="Subject(s) You Teach" name="subjects" error={errors.subjects} />
              <Field label="Preferred Location" name="preferred_location" error={errors.preferred_location} />
              <Field label="Availability (days / hours)" name="availability" error={errors.availability} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground">Brief about your teaching experience</label>
                <textarea
                  name="experience"
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.experience && <p className="mt-1 text-xs text-destructive">{errors.experience}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground">Resume (PDF, DOC, DOCX — max 10 MB)</label>
                <label className="mt-1.5 flex items-center gap-3 rounded-lg border border-dashed border-border bg-background px-3 py-2.5 text-sm cursor-pointer hover:bg-secondary/50 transition">
                  <Upload className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {resumeFile ? resumeFile.name : "Choose a file to upload"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.currentTarget.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      Submit Application <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}{required && <span className="text-accent"> *</span>}</label>
      <input
        type={type}
        name={name}
        aria-invalid={error ? true : undefined}
        className={`mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}