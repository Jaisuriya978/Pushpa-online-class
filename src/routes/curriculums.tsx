import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/curriculums")({
  head: () => ({
    meta: [
      { title: "Curriculums — UK, Cambridge IGCSE, UAE, Switzerland, Germany" },
      { name: "description", content: "Online tuition aligned with the UK National Curriculum, Cambridge International (IGCSE & A-Level), UAE, Swiss and German international school curricula." },
      { property: "og:title", content: "International Curriculums We Cover" },
      { property: "og:description", content: "Tuition aligned with UK, Cambridge, UAE, Swiss and German international curricula." },
      { property: "og:url", content: "/curriculums" },
    ],
    links: [{ rel: "canonical", href: "/curriculums" }],
  }),
  component: CurriculumsPage,
});

const items = [
  { flag: "🇬🇧", name: "UK National Curriculum", body: "Comprehensive support for Key Stages 1–5, from primary through A-Level." },
  { flag: "🇬🇧", name: "Cambridge International", body: "IGCSE and A-Level preparation with expert guidance and exam-board insights." },
  { flag: "🇦🇪", name: "UAE Curriculum", body: "Support for international schools across the UAE, aligned with school standards." },
  { flag: "🇨🇭", name: "Switzerland International Schools", body: "Customised tutoring aligned with Swiss international school requirements." },
  { flag: "🇩🇪", name: "Germany International Schools", body: "Academic support tailored to German international education standards." },
];

function CurriculumsPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">Curriculums</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold max-w-3xl">Aligned with leading international curricula.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground text-lg">Wherever your child studies, we match their school's syllabus, pace and assessment style.</p>
      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {items.map((i) => (
          <article key={i.name} className="rounded-3xl border border-border bg-card p-8">
            <div className="text-4xl">{i.flag}</div>
            <h2 className="mt-4 font-serif text-xl md:text-2xl font-semibold">{i.name}</h2>
            <p className="mt-2 text-muted-foreground">{i.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}