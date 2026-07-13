import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = { flag: string; name: string; note: string };

export function CurriculumCarousel({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive slides-per-view
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1024) setPerView(4);
      else if (w >= 640) setPerView(2);
      else setPerView(1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => i + 1), 3000);
    return () => clearInterval(id);
  }, [paused]);

  const total = items.length;
  // Duplicate items to create seamless infinite loop
  const looped = [...items, ...items];

  // Reset instantly when we've scrolled past the first set
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (index >= total) {
      const t = setTimeout(() => {
        // disable transition, snap back
        const el = trackRef.current;
        if (!el) return;
        el.style.transition = "none";
        setIndex(0);
        requestAnimationFrame(() => {
          if (el) el.style.transition = "";
        });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [index, total]);

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => (i <= 0 ? total - 1 : i - 1));

  const slideWidth = 100 / perView;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={containerRef} className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * slideWidth}%)`,
          }}
        >
          {looped.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="shrink-0 px-2"
              style={{ flex: `0 0 ${slideWidth}%` }}
            >
              <div className="card-soft p-5 hover:-translate-y-1 transition-transform h-full">
                <div className="text-3xl">{c.flag}</div>
                <h3 className="mt-3 text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous curriculum"
        onClick={prev}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full bg-white shadow-md border border-border hover:bg-secondary transition"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next curriculum"
        onClick={next}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full bg-white shadow-md border border-border hover:bg-secondary transition"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
