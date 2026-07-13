import { WhatsAppIcon } from "./WhatsAppIcon";

export function FloatingWhatsApp() {
  const phone = "918939577588";
  const text = encodeURIComponent(
    "Hi Pushpa Education, I'd like to know more about your tuition classes.",
  );
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-5 z-50 group"
    >
      <span
        className="relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl animate-pulse-ring"
        style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        <WhatsAppIcon className="size-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </span>
    </a>
  );
}