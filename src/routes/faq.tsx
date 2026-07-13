import { createFileRoute } from "@tanstack/react-router";

const faqs = [
  { q: "Are the classes conducted live?", a: "Yes, all classes are conducted live through online platforms with real-time interaction." },
  { q: "Do you offer one-to-one tuition?", a: "Yes — we offer both one-to-one and small group sessions, depending on your preference." },
  { q: "Can I book a trial class?", a: "Yes, we offer a free trial session before enrolment so you can experience our teaching first-hand." },
  { q: "Which countries do you support?", a: "We support students globally, including the UK, UAE, Switzerland, Germany and other international regions." },
  { q: "How do I become a tutor?", a: "Visit our Become a Tutor page and submit your application online — our team will review and reach out." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Pushpa Online Tuition" },
      { name: "description", content: "Answers to common questions about our online tuition classes, subjects, trial sessions and tutor recruitment." },
      { property: "og:title", content: "Frequently Asked Questions" },
      { property: "og:description", content: "Common questions about Pushpa Online Tuition." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question", name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">FAQ</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold max-w-2xl">Frequently asked questions.</h1>
      <div className="mt-12 max-w-3xl divide-y divide-border rounded-3xl border border-border bg-card">
        {faqs.map((f) => (
          <details key={f.q} className="group p-6 open:bg-secondary/30">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
              <span className="font-serif text-lg font-semibold text-foreground">{f.q}</span>
              <span className="mt-1 text-accent font-serif text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}