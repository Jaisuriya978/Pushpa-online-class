import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses & Subjects — Pushpa Online Tuition" },
      { name: "description", content: "Online tuition for Primary (Year 2–6), Secondary (Year 7–11) and A-Level students across Maths, English, Sciences, Computer Science, Business and Economics." },
      { property: "og:title", content: "Courses & Subjects" },
      { property: "og:description", content: "Personalised online tuition across primary, secondary and A-Level subjects." },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

const groups = [
  { label: "Primary School", year: "Year 2 – Year 6", subjects: ["Mathematics", "English", "Science", "Reading & Writing", "Grammar", "Reasoning"] },
  { label: "Secondary School", year: "Year 7 – Year 11", subjects: ["Mathematics", "English Language", "English Literature", "Physics", "Chemistry", "Biology", "Computer Science", "Business Studies", "Economics"] },
  { label: "A-Level & Advanced", year: "Sixth Form", subjects: ["Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Business Studies", "Computer Science"] },
];

function CoursesPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">Courses</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold max-w-3xl">Subjects we tutor.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground text-lg">From phonics to A-Level Further Maths — pick a stage to see the subjects we cover.</p>
      <div className="mt-12 space-y-8">
        {groups.map((g) => (
          <section key={g.label} className="rounded-3xl border border-border bg-card p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold">{g.label}</h2>
              <span className="text-sm text-muted-foreground">{g.year}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {g.subjects.map((s) => (
                <span key={s} className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-foreground">{s}</span>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-14 flex flex-wrap gap-3">
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Book a Free Trial <ArrowRight className="size-4" />
        </Link>
        <Link to="/curriculums" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary">
          See Curriculums
        </Link>
      </div>
    </div>
  );
}