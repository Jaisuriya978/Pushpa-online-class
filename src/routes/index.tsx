import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  CalendarClock,
  Sparkles,
  ClipboardCheck,
  Globe2,
  GraduationCap,
  Star,
  BookOpen,
  Beaker,
  Calculator,
  Languages,
  Play,
  Atom,
  PencilRuler,
  Award,
  Quote,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import heroImg from "@/assets/Student.jpeg";
import tutorImg from "@/assets/image.png";
import { CurriculumCarousel } from "@/components/site/CurriculumCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pushpa Online Tuition — International Tutors for UK, IGCSE, A-Level" },
      { name: "description", content: "Live one-to-one and small-group online tuition for Year 2 to A-Level. UK, Cambridge IGCSE & A-Level, UAE, Switzerland and German international curricula." },
      { property: "og:title", content: "Pushpa Online Tuition — Empowering Minds Worldwide" },
      { property: "og:description", content: "Personalised online tutoring for students worldwide across the leading international curricula." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const bullets = [
  "Expert International Tutors",
  "Live Interactive Classes",
  "One-to-One & Small Group Sessions",
  "Flexible Scheduling",
  "Proven Academic Results",
];

const whyUs = [
  { icon: GraduationCap, title: "Experienced International Tutors", body: "Qualified educators with deep expertise in international curricula." },
  { icon: Sparkles, title: "Personalised Learning", body: "Lesson plans designed around each student's pace and goals." },
  { icon: CalendarClock, title: "Flexible Schedule", body: "Pick timings that work for your family across time zones." },
  { icon: Users, title: "Interactive Live Classes", body: "Engaging sessions with modern teaching tools and digital resources." },
  { icon: ClipboardCheck, title: "Regular Assessments", body: "Track progress with tests, assignments and performance reports." },
  { icon: Globe2, title: "Global Learning Community", body: "Connect with educators and students from around the world." },
];

const curriculums = [
  { flag: "🇬🇧", name: "UK National Curriculum", note: "Key Stages 1–5" },
  { flag: "🇬🇧", name: "Cambridge International", note: "IGCSE & A-Level" },
  { flag: "🇦🇪", name: "UAE Curriculum", note: "International schools" },
  { flag: "🇨🇭", name: "Switzerland Int. Schools", note: "School-aligned tutoring" },
  { flag: "🇩🇪", name: "Germany Int. Schools", note: "International standards" },
];

const steps = [
  { n: "01", title: "Free Consultation", body: "Discuss your learning goals and academic requirements." },
  { n: "02", title: "Tutor Matching", body: "We assign the most suitable tutor for the student's needs." },
  { n: "03", title: "Trial Class", body: "Attend a free demo and experience our teaching approach." },
  { n: "04", title: "Start Learning", body: "Join regular live classes and track academic progress." },
  { n: "05", title: "Achieve Results", body: "Improve confidence, grades and subject understanding." },
];

const subjectIcons = [
  { icon: Calculator, label: "Mathematics" },
  { icon: Beaker, label: "Sciences" },
  { icon: Languages, label: "English" },
  { icon: BookOpen, label: "Humanities" },
];

const subjects = [
  { icon: Calculator, label: "Mathematics", note: "From foundations to A-Level Further Maths." },
  { icon: Beaker, label: "Sciences", note: "Biology, Chemistry & Physics with practicals." },
  { icon: Languages, label: "English", note: "Language, Literature & Academic Writing." },
  { icon: BookOpen, label: "Humanities", note: "History, Geography, Economics & Business." },
];

const tutors = [
  { name: "Ms. Priya S.", subject: "Mathematics · A-Level", years: "12+ yrs", initials: "PS" },
  { name: "Mr. Daniel R.", subject: "Physics & Chemistry", years: "10+ yrs", initials: "DR" },
  { name: "Ms. Anita K.", subject: "English & Literature", years: "9+ yrs", initials: "AK" },
  { name: "Dr. Omar H.", subject: "Biology · IGCSE", years: "14+ yrs", initials: "OH" },
];

const successStories = [
  { name: "Aarav", grade: "A* in A-Level Mathematics", place: "London, UK", detail: "Moved from a C to an A* in one academic year with weekly 1:1 sessions." },
  { name: "Layla", grade: "9 A*s at IGCSE", place: "Dubai, UAE", detail: "Structured revision and mock papers built confidence across all subjects." },
  { name: "Noah", grade: "Distinction — Cambridge Checkpoint", place: "Zurich, CH", detail: "Focused Maths and Science support brought consistent top scores." },
];

const parentReviews = [
  { name: "Mrs. Fatima", place: "Abu Dhabi", body: "Communication is superb. We receive weekly updates and detailed progress notes — exactly what parents need." },
  { name: "Mr. Thomas", place: "Manchester", body: "Our daughter looks forward to her lessons. The tutor is patient, structured, and truly cares about her progress." },
  { name: "Mrs. Schneider", place: "Munich", body: "Reliable, professional and academically strong. Highly recommended for international families." },
];

const testimonials = [
  { quote: "Pushpa Online Tuition helped me improve my Mathematics grades significantly. The tutors are highly supportive and knowledgeable.", name: "Sarah", place: "UAE" },
  { quote: "The personalised lessons and regular feedback helped me achieve excellent IGCSE results.", name: "Ahmed", place: "Dubai" },
  { quote: "My confidence in Physics and Chemistry improved tremendously after joining Pushpa Online Tuition.", name: "David", place: "UK" },
];

const faqs = [
  { q: "How do the online classes work?", a: "Classes are live, one-to-one or small group, held over secure video with an interactive whiteboard and shared resources." },
  { q: "Which curricula do you cover?", a: "UK National, Cambridge IGCSE & A-Level, UAE, Switzerland and Germany international schools — Year 2 to A-Level." },
  { q: "Do you offer a free trial class?", a: "Yes. Every new family receives a complimentary trial session with a matched tutor before committing." },
  { q: "How are tutors selected?", a: "Every tutor is qualified, interviewed, background-checked and assessed on a live demo lesson." },
  { q: "Can we choose the class schedule?", a: "Absolutely. Schedules are flexible across time zones and can be adjusted around exams and holidays." },
];

function Index() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 animate-shimmer"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 85% 5%, rgba(37,99,235,0.10), transparent 60%), radial-gradient(50% 55% at 5% 30%, rgba(245,158,11,0.12), transparent 60%), radial-gradient(45% 55% at 50% 100%, rgba(37,99,235,0.08), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />

        <FloatingIcon className="left-[6%] top-[18%] animate-float" tint="blue"><BookOpen className="size-5" /></FloatingIcon>
        <FloatingIcon className="left-[3%] bottom-[18%] animate-float-slow" tint="amber"><GraduationCap className="size-5" /></FloatingIcon>
        <FloatingIcon className="right-[4%] top-[14%] animate-float-slow" tint="amber"><PencilRuler className="size-5" /></FloatingIcon>
        <FloatingIcon className="right-[7%] bottom-[10%] animate-float" tint="blue"><Atom className="size-5" /></FloatingIcon>
        <FloatingIcon className="left-[45%] top-[6%] animate-float" tint="amber"><Calculator className="size-5" /></FloatingIcon>

        <div className="container-page relative pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#2563EB] mr-2 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                Excellence in Education
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
              Empowering Minds at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#F59E0B]">
                Pushpa Online
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Unlock your academic potential with personalised online tuition. We bridge the
              gap between curiosity and mastery through expert-led sessions tailored for every
              student — Year 2 to A-Level, across leading international curricula.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="size-4 text-[#2563EB]" /> {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 hover:scale-[1.03] transition-transform"
                style={{ backgroundImage: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)" }}
              >
                Book a Free Demo <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-foreground bg-white border border-border hover:bg-secondary transition"
              >
                Explore Courses
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-200 to-blue-400" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-amber-200 to-amber-400" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-400" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#0F172A] flex items-center justify-center text-[10px] text-white font-bold">+5k</div>
              </div>
              <div className="text-sm">
                <p className="font-bold text-foreground">5,000+ Happy Students</p>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
                  <span className="ml-1 text-xs text-muted-foreground">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#2563EB]/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#F59E0B]/15 rounded-full blur-3xl" />

            <div className="relative z-10 rounded-3xl overflow-hidden border border-white shadow-2xl bg-card">
              <div className="relative">
                <img
                  src={heroImg}
                  alt="International students learning online together"
                  className="w-full h-[420px] lg:h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />
                <button
                  type="button"
                  aria-label="Play intro video"
                  className="absolute inset-0 grid place-items-center group"
                >
                  <span className="grid place-items-center size-20 rounded-full bg-white/95 text-[#2563EB] shadow-2xl transition-transform group-hover:scale-110">
                    <Play className="size-8 fill-current" />
                  </span>
                </button>
              </div>
            </div>

            <div className="absolute top-6 -left-4 md:-left-8 z-20 glass p-4 rounded-2xl animate-float">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center size-9 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B]">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Live Sessions</p>
                  <p className="text-sm font-bold text-foreground">24/7 Support</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 -right-4 md:-right-8 z-20 glass p-4 rounded-2xl animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center size-9 rounded-lg bg-[#2563EB]/15 text-[#2563EB]">
                  <Award className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Result Driven</p>
                  <p className="text-sm font-bold text-foreground">98% Score Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBJECTS STRIP */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-6 flex flex-wrap items-center justify-between gap-6">
          <p className="text-sm font-medium text-muted-foreground">We tutor across all core subjects</p>
          <div className="flex flex-wrap gap-6">
            {subjectIcons.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-foreground">
                <Icon className="size-4 text-[#2563EB]" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Why choose us</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">A learning experience built around your child.</h2>
          <p className="mt-3 text-muted-foreground">Six reasons families across the world trust Pushpa Online Tuition.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyUs.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-soft p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="grid place-items-center size-12 rounded-xl bg-gradient-to-br from-[#2563EB]/10 to-[#F59E0B]/10 text-[#2563EB] group-hover:scale-110 transition-transform">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR TUTORS */}
      <section className="bg-gradient-to-b from-secondary/40 to-background border-y border-border">
        <div className="container-page py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Our tutors</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">Meet the educators behind the results.</h2>
              <p className="mt-3 text-muted-foreground">Qualified, vetted and passionate — our tutors bring years of international teaching experience.</p>
            </div>
            <Link to="/tutors" className="text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1">
              Meet all tutors <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tutors.map((t) => (
              <div key={t.name} className="card-soft p-6 text-center hover:-translate-y-1 transition-transform">
                <div
                  className="mx-auto grid place-items-center size-20 rounded-full text-white text-lg font-bold shadow-lg"
                  style={{ backgroundImage: "linear-gradient(135deg, #0F172A 0%, #2563EB 100%)" }}
                >
                  {t.initials}
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.subject}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#B45309]">
                  <Award className="size-3" /> {t.years}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Subjects</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">A subject for every learner.</h2>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {subjects.map(({ icon: Icon, label, note }) => (
            <div key={label} className="card-soft p-6 hover:-translate-y-1 transition-transform">
              <div className="grid place-items-center size-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{label}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUMS */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container-page py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Curriculums we cover</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">Aligned with leading international boards.</h2>
            </div>
            <Link to="/curriculums" className="text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1">
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10">
            <CurriculumCarousel items={curriculums} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">How it works</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">From first call to better grades — in five steps.</h2>
        </div>
        <ol className="mt-10 grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {steps.map((s) => (
            <li key={s.n} className="card-soft p-6">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#F59E0B]">{s.n}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* SUCCESS STORIES */}
      <section className="bg-gradient-to-b from-background to-secondary/40 border-y border-border">
        <div className="container-page py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Success stories</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Real students. Real results.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {successStories.map((s) => (
              <div key={s.name} className="card-soft p-6 flex flex-col">
                <div
                  className="inline-flex self-start items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)" }}
                >
                  <Award className="size-3.5" /> {s.grade}
                </div>
                <p className="mt-4 text-foreground leading-relaxed">{s.detail}</p>
                <p className="mt-6 text-sm text-muted-foreground">— {s.name}, {s.place}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARENT REVIEWS + STUDENT VOICES */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Parent reviews</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Trusted by families worldwide.</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {parentReviews.map((r) => (
            <figure key={r.name} className="card-soft p-6 flex flex-col relative">
              <Quote className="absolute top-4 right-4 size-8 text-[#2563EB]/15" />
              <div className="flex items-center gap-0.5 text-[#F59E0B]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-foreground leading-relaxed">"{r.body}"</blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">— {r.name}, {r.place}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure key={t.name} className="card-soft p-6">
              <div className="flex items-center gap-0.5 text-[#F59E0B]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <blockquote className="mt-3 text-sm text-foreground leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">— {t.name}, {t.place}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* BOOK FREE DEMO */}
      <section className="container-page pb-20">
        <div
          className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-white shadow-2xl"
          style={{ backgroundImage: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)" }}
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F59E0B]/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2563EB]/40 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Book free demo</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">Try a free class with a matched tutor.</h2>
              <p className="mt-3 text-white/80 max-w-md">
                See how a Pushpa tutor works with your child before you commit. Personalised. Zero pressure. Complimentary.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-[#0F172A] shadow-xl hover:scale-[1.03] transition-transform"
                  style={{ backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)" }}
                >
                  Book Free Demo <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 text-foreground">
              <p className="text-sm font-semibold text-[#2563EB]">What you'll get</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  "30-minute complimentary trial lesson",
                  "Personalised learning assessment",
                  "Curriculum & tutor match consultation",
                  "No credit card required",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-[#2563EB] mt-0.5" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page pb-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">FAQ</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Answers for parents & students.</h2>
        </div>
        <div className="mt-8 grid gap-3 max-w-3xl">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="container-page pb-24">
        <div className="card-soft p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Contact</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Talk to our academic team.</h2>
            <p className="mt-3 text-muted-foreground">
              Questions about tutors, curricula or scheduling? We usually reply within one business hour.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a href="mailto:info@pushpaedu.com" className="flex items-center gap-3 hover:text-[#2563EB] transition">
                <span className="grid place-items-center size-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><Mail className="size-5" /></span>
                info@pushpaedu.com
              </a>
              <a href="tel:+918939577588" className="flex items-center gap-3 hover:text-[#2563EB] transition">
                <span className="grid place-items-center size-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><Phone className="size-5" /></span>
                +91 89395 77588
              </a>
              <a href="https://wa.me/918939577588" className="flex items-center gap-3 hover:text-[#2563EB] transition">
                <span className="grid place-items-center size-10 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]"><MessageCircle className="size-5" /></span>
                WhatsApp our team
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={tutorImg}
              alt="Pushpa Online tutor teaching a student"
              className="rounded-2xl border border-border shadow-xl object-cover w-full h-72 md:h-80"
            />
            <div className="absolute -bottom-5 -left-5 glass p-4 rounded-2xl">
              <p className="text-xs text-muted-foreground">Average response</p>
              <p className="text-lg font-bold text-foreground">under 1 hour</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FloatingIcon({
  children,
  className = "",
  tint = "blue",
}: {
  children: React.ReactNode;
  className?: string;
  tint?: "blue" | "amber";
}) {
  const style =
    tint === "amber"
      ? "bg-[#F59E0B]/15 text-[#B45309] border-[#F59E0B]/25"
      : "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20";
  return (
    <div
      aria-hidden
      className={`absolute hidden md:flex size-11 items-center justify-center rounded-xl border backdrop-blur-md shadow-md ${style} ${className}`}
    >
      {children}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-semibold text-foreground">{q}</span>
        <ChevronDown className={`size-5 text-[#2563EB] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground -mt-1">{a}</div>}
    </div>
  );
}