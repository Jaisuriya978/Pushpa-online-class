import { Link } from "@tanstack/react-router";
import { Mail, Phone, Globe, Clock, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center size-9 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-serif text-lg font-semibold">Pushpa Online Tuition</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Personalised, live online tutoring for Year 2 to A-Level students worldwide.
            UK, Cambridge, UAE, Switzerland and German international curricula.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-base mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/courses" className="hover:text-foreground">Courses</Link></li>
            <li><Link to="/curriculums" className="hover:text-foreground">Curriculums</Link></li>
            <li><Link to="/payments" className="hover:text-foreground">Payments</Link></li>
            <li><Link to="/tutors" className="hover:text-foreground">Become a Tutor</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-base mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-4" /> +91 89395 77588</li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              <a href="mailto:info@pushpaedu.com" className="hover:underline">info@pushpaedu.com</a>
            </li>
            <li className="flex items-center gap-2"><Globe className="size-4" /> www.pushpaedu.com</li>
            <li className="flex items-center gap-2"><Clock className="size-4" /> Mon–Sat, 9 AM – 8 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Pushpa Online Tuition. All rights reserved.</p>
          <p>Teach. Learn. Achieve.</p>
        </div>
      </div>
    </footer>
  );
}