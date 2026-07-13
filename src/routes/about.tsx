import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Pushpa Online Tuition" },
      { name: "description", content: "Excellence in online education for international students. Our mission, vision and approach to personalised tutoring." },
      { property: "og:title", content: "About Pushpa Online Tuition" },
      { property: "og:description", content: "Excellence in online education for international students." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">About us</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold max-w-3xl">
        Excellence in online education.
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        At Pushpa Online Tuition, we help students achieve academic success through high-quality
        online learning. Our experienced tutors provide personalised guidance across a wide range
        of subjects, ensuring every student receives the support they need to excel.
      </p>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        We work with students from different countries and educational systems, delivering engaging
        and effective lessons that build confidence, improve grades, and foster a lifelong love for
        learning.
      </p>

      <div className="mt-14 grid md:grid-cols-3 gap-5">
        {[
          { icon: Target, title: "Our Mission", body: "To provide accessible, affordable and world-class education to students across the globe." },
          { icon: Eye, title: "Our Vision", body: "To become a trusted international learning platform that empowers students and educators worldwide." },
          { icon: Heart, title: "Our Values", body: "Care for every student, respect for every educator, and an unwavering commitment to academic excellence." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-7">
            <div className="grid place-items-center size-11 rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-border bg-secondary/40 p-8 md:p-12 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold max-w-xl">
          Curious how we can help your child?
        </h2>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Book a Free Trial <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}