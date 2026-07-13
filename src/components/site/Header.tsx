import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/curriculums", label: "Curriculums" },
  { to: "/payments", label: "Payments" },
  { to: "/tutors", label: "Become a Tutor" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center size-9 rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">
            Pushpa<span className="text-accent">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-foreground bg-secondary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/contact"
          className="hidden md:inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition"
        >
          Free Trial Class
        </Link>
        <button
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-md hover:bg-secondary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-page flex flex-col py-3 gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Free Trial Class
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}