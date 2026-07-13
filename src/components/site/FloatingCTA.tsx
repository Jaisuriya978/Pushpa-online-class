import { Link } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

export function FloatingCTA() {
  return (
    <Link
      to="/contact"
      aria-label="Book a free class"
      className="fixed bottom-5 right-5 z-50 group"
    >
      <span className="relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl animate-pulse-ring"
        style={{ backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)" }}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        <CalendarCheck className="size-4" />
        <span className="hidden sm:inline">Book a Class</span>
      </span>
    </Link>
  );
}