import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  Check,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Landmark,
  Globe,
  Lock,
  Zap,
  BadgeCheck,
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  Building2,
  Send,
  Clock,
} from "lucide-react";

const searchSchema = z.object({
  level: z.enum(["y28", "y9g", "asa"]).optional(),
  duration: z.enum(["monthly", "3m", "6m", "yearly"]).optional(),
  rate: z.coerce.number().optional(),
});

export const Route = createFileRoute("/payments")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Choose Your Learning Plan — Pushpa Online Tuition" },
      {
        name: "description",
        content:
          "Pick the plan that fits your curriculum and pay securely with UPI, cards, QR, net banking or international methods.",
      },
      { property: "og:title", content: "Choose Your Learning Plan — Pushpa Online Tuition" },
      {
        property: "og:description",
        content: "Flexible monthly, 3, 6 and 12-month plans for Years 2 through A-Level.",
      },
      { property: "og:url", content: "/payments" },
    ],
    links: [{ rel: "canonical", href: "/payments" }],
  }),
  component: PaymentsPage,
});

type LevelKey = "y28" | "y9g" | "asa";
type DurationKey = "monthly" | "3m" | "6m" | "yearly";

const PLANS: Record<
  LevelKey,
  {
    id: LevelKey;
    title: string;
    price: string;
    hourly: number; // headline hourly used for checkout when clicking Select Plan
    accent: string;
    ribbon?: string;
    features: string[];
    gradient: string;
    prices: Record<DurationKey, number>;
  }
> = {
  y28: {
    id: "y28",
    title: "Years 2 – 8",
    price: "£12 – £15 / Hour",
    hourly: 12,
    accent: "#2563EB",
    features: [
      "3 Classes per Week",
      "12 Classes + 2 Monthly Tests",
      "Free Worksheets",
      "Regular Progress Reports",
      "Experienced UK Tutors",
    ],
    gradient: "from-[#0F172A] to-[#1E3A8A]",
    prices: { monthly: 144, "3m": 432, "6m": 864, yearly: 1728 },
  },
  y9g: {
    id: "y9g",
    title: "Years 9 – GCSE",
    price: "£15 – £20 / Hour",
    hourly: 15,
    accent: "#7C3AED",
    ribbon: "Most Popular",
    features: [
      "3 Classes per Week",
      "12 Classes + 2 Monthly Tests",
      "Free Worksheets",
      "Progress Tracking",
      "Experienced UK Tutors",
    ],
    gradient: "from-[#7C3AED] to-[#A855F7]",
    prices: { monthly: 180, "3m": 540, "6m": 1080, yearly: 2160 },
  },
  asa: {
    id: "asa",
    title: "AS & A Level",
    price: "£25 – £30 / Hour",
    hourly: 25,
    accent: "#059669",
    features: [
      "3 Classes per Week",
      "12 Classes + 2 Monthly Tests",
      "Free Worksheets",
      "Progress Reports",
      "Expert Tutors",
    ],
    gradient: "from-[#059669] to-[#10B981]",
    prices: { monthly: 300, "3m": 900, "6m": 1800, yearly: 3600 },
  },
};

const DURATION_LABELS: Record<DurationKey, { label: string; short: string; discount: number }> = {
  monthly: { label: "Monthly Plan", short: "1 Month", discount: 0 },
  "3m": { label: "3 Months Plan", short: "3 Months", discount: 5 },
  "6m": { label: "6 Months Plan", short: "6 Months", discount: 10 },
  yearly: { label: "Yearly Plan", short: "12 Months", discount: 15 },
};

function PaymentsPage() {
  const { level, duration, rate } = Route.useSearch();
  const showCheckout = Boolean(level && duration);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Hero showCheckout={showCheckout} />
      {showCheckout ? (
        <CheckoutView level={level as LevelKey} duration={duration as DurationKey} rate={rate} />
      ) : (
        <PlansView />
      )}
    </div>
  );
}

function Hero({ showCheckout }: { showCheckout: boolean }) {
  return (
    <section
      className="relative overflow-hidden py-14 md:py-20 text-white"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(245,158,11,0.4), transparent 40%), radial-gradient(circle at 80% 70%, rgba(236,72,153,0.3), transparent 40%)",
        }}
      />
      <div className="container-page relative text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
          <Sparkles className="size-4" />
          <span className="uppercase tracking-wider">
            {showCheckout ? "Secure Checkout" : "Flexible Learning Plans"}
          </span>
        </div>
        <h1 className="mt-5 text-3xl md:text-5xl font-bold leading-tight">
          {showCheckout ? "Complete Your Payment" : "Choose Your Learning Plan"}
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-white/85">
          {showCheckout
            ? "Review your plan details and pay securely using your preferred method."
            : "Select the plan that best matches your curriculum and proceed securely to payment."}
        </p>
      </div>
    </section>
  );
}

/* ============================ PLAN SELECTION ============================ */

function PlansView() {
  const navigate = useNavigate({ from: "/payments" });

  return (
    <>
      {/* Plan cards */}
      <section className="container-page pt-14 md:pt-20">
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.values(PLANS) as (typeof PLANS)[LevelKey][]).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() =>
                navigate({
                  search: { level: plan.id, duration: "monthly", rate: plan.hourly },
                })
              }
            />
          ))}
        </div>
      </section>

      {/* Flexible plans table */}
      <section className="container-page pt-14 md:pt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 text-[#2563EB] px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            💰 Flexible Plans
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#0F172A]">
            Pick a Duration & Save More
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Every price below is clickable — select one to lock in your plan and continue to
            secure payment.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <FlexibleTable
            onPick={(level, duration) =>
              navigate({ search: { level, duration, rate: PLANS[level].hourly } })
            }
          />
          <DiscountsCard />
        </div>
      </section>

      {/* Trust banner */}
      <section className="container-page py-14 md:py-20">
        <TrustBanner />
      </section>
    </>
  );
}

function PlanCard({
  plan,
  onSelect,
}: {
  plan: (typeof PLANS)[LevelKey];
  onSelect: () => void;
}) {
  const featured = Boolean(plan.ribbon);
  return (
    <div
      className={`relative rounded-3xl bg-white shadow-xl border ${
        featured ? "border-transparent ring-2 ring-[#7C3AED]" : "border-slate-100"
      } overflow-hidden flex flex-col`}
    >
      {plan.ribbon && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-[#F59E0B] px-3 py-1 text-[11px] font-bold text-[#0F172A] shadow-md">
          {plan.ribbon}
        </div>
      )}
      <div className={`px-6 py-6 bg-gradient-to-r ${plan.gradient} text-white`}>
        <h3 className="text-lg font-bold">{plan.title}</h3>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{plan.price}</p>
        <p className="mt-1 text-xs text-white/80">Based on 12 classes per month</p>
      </div>
      <ul className="flex-1 p-6 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 grid place-items-center size-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
              <Check className="size-3.5" />
            </span>
            <span className="text-slate-700">{f}</span>
          </li>
        ))}
      </ul>
      <div className="p-6 pt-0">
        <button
          onClick={onSelect}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${plan.accent} 0%, #0F172A 140%)` }}
        >
          Select Plan
        </button>
      </div>
    </div>
  );
}

function FlexibleTable({
  onPick,
}: {
  onPick: (level: LevelKey, duration: DurationKey) => void;
}) {
  const durations: DurationKey[] = ["monthly", "3m", "6m", "yearly"];
  return (
    <div className="lg:col-span-2 rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] px-6 py-4">
        <h3 className="text-white font-bold text-lg">Flexible Plans</h3>
        <p className="text-white/70 text-xs mt-1">All prices in GBP (£) · Click any price to continue</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Level</th>
              {durations.map((d) => (
                <th key={d} className="text-right font-semibold px-4 py-3">
                  {DURATION_LABELS[d].label}
                  {DURATION_LABELS[d].discount > 0 && (
                    <span className="ml-1 text-[10px] font-bold text-emerald-600">
                      −{DURATION_LABELS[d].discount}%
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Object.values(PLANS) as (typeof PLANS)[LevelKey][]).map((plan) => (
              <tr key={plan.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                <td className="px-4 py-3 font-semibold text-[#0F172A]">{plan.title}</td>
                {durations.map((d) => (
                  <td key={d} className="px-4 py-3 text-right">
                    <button
                      onClick={() => onPick(plan.id, d)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold text-[#2563EB] hover:bg-[#2563EB]/10 hover:scale-105 transition"
                    >
                      £{plan.prices[d].toLocaleString()}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DiscountsCard() {
  const rows = [
    { plan: "Monthly", discount: "No discount", tone: "muted" as const },
    { plan: "3 Months", discount: "5% Off", tone: "good" as const },
    { plan: "6 Months", discount: "10% Off", tone: "good" as const },
    { plan: "Yearly", discount: "15% Off", tone: "good" as const },
  ];
  return (
    <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] px-6 py-4">
        <h3 className="text-[#0F172A] font-bold text-lg">🎉 Longer Plan Discounts</h3>
        <p className="text-[#0F172A]/70 text-xs mt-1">Save more when you commit longer</p>
      </div>
      <ul className="p-4 divide-y divide-slate-100">
        {rows.map((d) => (
          <li key={d.plan} className="flex items-center justify-between py-3 px-2">
            <span className="font-semibold text-[#0F172A]">{d.plan}</span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                d.tone === "muted"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {d.discount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustBanner() {
  const badges = [
    { icon: BadgeCheck, text: "100% Secure Payment" },
    { icon: Lock, text: "SSL Encrypted" },
    { icon: Zap, text: "Instant Confirmation" },
    { icon: ShieldCheck, text: "Safe Transactions" },
  ];
  return (
    <div
      className="rounded-2xl p-5 md:p-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 shadow-lg"
      style={{ background: "linear-gradient(90deg, #EC4899 0%, #F59E0B 50%, #10B981 100%)" }}
    >
      {badges.map((b) => (
        <div
          key={b.text}
          className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-[#0F172A] shadow-sm"
        >
          <b.icon className="size-4 text-emerald-600" />
          <span>{b.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================ CHECKOUT VIEW ============================ */

type MethodId =
  //| "gpay"
  //| "upi"
  //| "debit"
  //| "credit"
  | "netbank"
  | "stripe"
  //| "razorpay"
  | "wise"
  | "remitly";

// Methods that are manually confirmed (no live gateway API) rather than
// instantly verified. These submit a "pending" record for staff to match
// against their Wise / Remitly account and confirm by hand.
const MANUAL_METHODS: MethodId[] = ["wise", "remitly"];

// Loaded from Supabase project settings / Vercel env. Must be set for Razorpay to function.
const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL; // e.g. https://<ref>.supabase.co/functions/v1
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// TODO: replace with your real Wise Business receiving account details,
// copied from the Wise dashboard (Account details > GBP/EUR/USD etc).
// You can list more than one currency account if you accept transfers in
// several currencies — swap/extend this object as needed.
const WISE_RECEIVING_ACCOUNT = {
  accountHolder: "Pushpa Tuition Ltd",
  bankName: "Wise Payments Limited",
  sortCode: "00-00-00",
  accountNumber: "00000000",
  iban: "GB00 TRWI 0000 0000 0000 00",
  swiftBic: "TRWIGB2LXXX",
};

// TODO: replace with the phone number / name actually registered to receive
// transfers on Remitly. Remitly has no merchant API — this is a manual,
// person-to-person transfer that your team confirms by hand.
const REMITLY_RECIPIENT = {
  recipientName: "Pushpa Tuition — Accounts",
  phone: "+91 89395 77588",
  country: "India",
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutView({
  level,
  duration,
  rate,
}: {
  level: LevelKey;
  duration: DurationKey;
  rate?: number;
}) {
  const plan = PLANS[level];
  const dur = DURATION_LABELS[duration];
  const subtotal = plan.prices[duration];
  const discount = Math.round((subtotal * dur.discount) / 100);
  const total = subtotal - discount;
  const hourly = rate ?? plan.hourly;

  const [paid, setPaid] = useState(false);
  const [submitted, setSubmitted] = useState(false); // manual-method pending confirmation
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [method, setMethod] = useState<MethodId>("netbank");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [transferNote, setTransferNote] = useState(""); // optional txn id/screenshot note for manual method
  const [customer, setCustomer] = useState({
  fullName: "",
  email: "",
  phone: "",
});

  // Stable per-checkout reference so staff can match an incoming Wise/Remitly
  // transfer to this exact order. Regenerated only if the plan/duration changes.
  const referenceCode = useMemo(
    () => `PE-${plan.id.toUpperCase()}-${duration.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    [plan.id, duration],
  );

  const methods: { id: MethodId; name: string; icon: typeof Smartphone; color: string }[] =
    useMemo(
      () => [
       // { id: "gpay", name: "Google Pay", icon: Smartphone, color: "#4285F4" },
       // { id: "upi", name: "UPI", icon: Smartphone, color: "#1E3A8A" },
       // { id: "debit", name: "Debit Card", icon: CreditCard, color: "#2563EB" },
       // { id: "credit", name: "Credit Card", icon: CreditCard, color: "#7C3AED" },
        //{ id: "netbank", name: "Net Banking", icon: Landmark, color: "#059669" },
        //{ id: "stripe", name: "Stripe", icon: CreditCard, color: "#635BFF" },
       // { id: "razorpay", name: "Razorpay", icon: CreditCard, color: "#528FF0" },
        { id: "wise", name: "Wise", icon: Building2, color: "#00B9A2" },
        { id: "remitly", name: "Remitly", icon: Send, color: "#5A3E9E" },
      ],
      [],
    );

  async function handleManualPaymentSubmit(methodId: "wise" | "remitly") {
    setPaymentError(null);

    if (!SUPABASE_FUNCTIONS_URL) {
      setPaymentError("Payment backend is not configured (missing VITE_SUPABASE_FUNCTIONS_URL).");
      return;
    }

    setProcessing(true);
    try {
      // Records a PENDING submission — this does not mark the order as paid.
      // Your team confirms the transfer arrived in Wise / Remitly, then
      // updates the record and emails the customer. See
      // supabase/functions/manual-payment-submit for the backend.
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/manual-payment-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: methodId,
          customer_name: customer.fullName,
          customer_email: customer.email,
          customer_phone: customer.phone,
          plan_level: plan.id,
          plan_title: plan.title,
          duration: DURATION_LABELS[duration].label,
          amount: total,
          currency: "GBP",
          reference_code: referenceCode,
          sender_note: transferNote || null,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`Could not submit your payment details (${res.status}). ${errBody}`.trim());
      }

      const data = await res.json();
      if (!data?.submitted) {
        throw new Error("Could not record your submission. Please contact support.");
      }

      setPaid(true);
    } catch (err: any) {
      setPaymentError(
        err?.message ?? "Something went wrong submitting your payment details. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handlePaySecurely() {
    setPaymentError(null);

    if (method === "wise" || method === "remitly") {
      await handleManualPaymentSubmit(method);
      return;
    }

    if (method === "stripe") {

  if (!customer.fullName.trim()) {
    setPaymentError("Please enter your Full Name.");
    return;
  }

  if (!customer.email.trim()) {
    setPaymentError("Please enter your Email Address.");
    return;
  }

  if (!customer.phone.trim()) {
    setPaymentError("Please enter your Phone Number.");
    return;
  }

}

    //if (method !== "razorpay") 
    {
      // NOTE: every other method here is still a UI stub — wire these up to their
      // own gateway/backend calls the same way Razorpay is handled below before
      // relying on this in production.
     setPaid(true);
     return;
    }

    setProcessing(true);
    try {
      if (!RAZORPAY_KEY_ID) {
        throw new Error("Razorpay is not configured (missing VITE_RAZORPAY_KEY_ID).");
      }
      if (!SUPABASE_FUNCTIONS_URL) {
        throw new Error("Payment backend is not configured (missing VITE_SUPABASE_FUNCTIONS_URL).");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay checkout. Check your connection and try again.");
      }

      // 1. Create the order server-side (Edge Function: razorpay-create-order)
      const orderRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/razorpay-create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total, // in GBP; the function converts to the smallest currency unit
          currency: "GBP",
          plan_level: plan.id,
          plan_title: plan.title,
          duration: DURATION_LABELS[duration].label,
          notes: {
            plan: plan.title,
            duration: DURATION_LABELS[duration].label,
          },
        }),
      });

      if (!orderRes.ok) {
        const errBody = await orderRes.text().catch(() => "");
        throw new Error(`Could not start payment (${orderRes.status}). ${errBody}`.trim());
      }

      const order = await orderRes.json();
      if (!order?.id) {
        throw new Error("Payment provider did not return a valid order.");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Pushpa Tuition",
        description: `${plan.title} - ${DURATION_LABELS[duration].label}`,
        order_id: order.id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // 2. Verify the payment server-side before trusting it (Edge Function: razorpay-verify-payment)
          try {
            const verifyRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/razorpay-verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment could not be verified. Please contact support before retrying.");
            }

            const verifyData = await verifyRes.json();
            if (!verifyData?.verified) {
              throw new Error("Payment verification failed. Please contact support.");
            }

            setPaid(true);
          } catch (verifyErr: any) {
            setPaymentError(
              verifyErr?.message ??
                "We could not confirm your payment. If money was deducted, please contact support with your payment ID.",
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            // User closed the Razorpay modal without paying
            setProcessing(false);
          },
        },
        prefill: {},
        theme: { color: plan.accent },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setPaymentError(resp?.error?.description ?? "Payment failed. Please try again.");
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err?.message ?? "Something went wrong starting the payment. Please try again.");
      setProcessing(false);
    }
  }

  const isManualMethod = MANUAL_METHODS.includes(method);

  return (
    <section className="container-page py-14 md:py-16">
      <Link
        to="/payments"
        search={{}}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to plans
      </Link>

      {paid ? (
        <PaymentSuccess plan={plan} duration={duration} total={total} />
      ) : submitted ? (
        <ManualPaymentPending
          plan={plan}
          duration={duration}
          total={total}
          referenceCode={referenceCode}
          method={method as "wise" | "remitly"}
        />
      ) : (
        <div className="mt-6 grid lg:grid-cols-5 gap-8">
          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden sticky top-24">
              <div className={`px-6 py-5 bg-gradient-to-r ${plan.gradient} text-white`}>
                <p className="text-xs uppercase tracking-wider text-white/70">Selected Plan</p>
                <h2 className="mt-1 text-2xl font-bold">{plan.title}</h2>
                <p className="mt-1 text-sm text-white/85">
                  {dur.short} · £{hourly}/hour
                </p>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <Row label="Curriculum" value={plan.title} />
                <Row label="Duration" value={dur.label} />
                <Row label="Hourly Rate" value={`£${hourly}`} />
                <Row label="Subtotal" value={`£${subtotal.toLocaleString()}`} />
                <Row
                  label={`Discount (${dur.discount}%)`}
                  value={`− £${discount.toLocaleString()}`}
                  valueClass="text-emerald-600 font-bold"
                />
                <div className="mt-3 border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-[#0F172A]">Total</span>
                  <span className="text-2xl font-extrabold text-[#0F172A]">
                    £{total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 leading-relaxed">
                  All payments are processed securely. A receipt will be sent to your email
                  automatically after successful payment.
                </div>
              </div>
            </div>
          </div>

          {/* Methods + per-method workflow panel */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Select a payment method</h3>
              <p className="text-sm text-slate-600 mt-1">
                Choose your preferred method to complete the payment.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {methods.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMethod(m.id);
                        setPaymentError(null);
                      }}
                      className={`group rounded-2xl border-2 bg-white p-4 text-left transition shadow-sm hover:shadow-md ${
                        active ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="grid place-items-center size-10 rounded-xl text-white shadow-md"
                          style={{ backgroundColor: m.color }}
                        >
                          <m.icon className="size-5" />
                        </span>
                        <div>
                          <p className="font-bold text-sm text-[#0F172A]">{m.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {active ? "Selected" : "Tap to choose"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          <PaymentMethodPanel
  method={method}
  total={total}
  upiId={upiId}
  setUpiId={setUpiId}
  selectedBank={selectedBank}
  setSelectedBank={setSelectedBank}
  card={card}
  setCard={setCard}
  referenceCode={referenceCode}
  transferNote={transferNote}
  setTransferNote={setTransferNote}
  customer={customer}
  setCustomer={setCustomer}
/>

            {paymentError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            <button
              onClick={handlePaySecurely}
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-xl transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)" }}
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing…
                </>
              ) : isManualMethod ? (
                <>
                  <Send className="size-4" /> I've Sent the Payment
                </>
              ) : (
                <>
                  <Lock className="size-4" /> Pay £{total.toLocaleString()} Securely
                </>
              )}
            </button>

            <TrustBanner />

            {/* Help */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-6 text-white shadow-xl grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-lg">Need help paying?</h4>
                <p className="mt-1 text-sm text-white/75">
                  Our team will guide you through the payment.
                </p>
              </div>
              <div className="space-y-2 text-sm sm:text-right">
                <a
                  href="tel:+918939577588"
                  className="flex items-center gap-2 sm:justify-end hover:text-[#F59E0B]"
                >
                  <Phone className="size-4" /> +91 8939 577 588
                </a>
                <a
                  href="mailto:support@pushpaedu.com"
                  className="flex items-center gap-2 sm:justify-end hover:text-[#F59E0B]"
                >
                  <Mail className="size-4" /> support@pushpaedu.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---- Per-method payment panels ---- */

function PaymentMethodPanel({
  method,
  total,
  upiId,
  setUpiId,
  selectedBank,
  setSelectedBank,
  card,
  setCard,
  referenceCode,
  transferNote,
  setTransferNote,
  customer,
  setCustomer,
}: {
   method: MethodId;
  total: number;
  upiId: string;
  setUpiId: (v: string) => void;
  selectedBank: string | null;
  setSelectedBank: (v: string) => void;
  card: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
  setCard: (
    v: {
      number: string;
      name: string;
      expiry: string;
      cvv: string;
    }
  ) => void;

  referenceCode: string;
  transferNote: string;
  setTransferNote: (v: string) => void;

  customer: {
    fullName: string;
    email: string;
    phone: string;
  };

  setCustomer: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
    }>
  >;
}) {
   /* if (method === "gpay") {
    return (
      <div className="rounded-3xl bg-white border-[3px] border-[#2563EB] shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <QrPlaceholder />
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-lg font-bold text-[#0F172A]">Scan to Pay</h4>
          <p className="mt-1 text-sm font-semibold text-[#2563EB]">Fast • Safe • Secure</p>
          <p className="mt-3 text-sm text-slate-600 max-w-sm">
            Open Google Pay, PhonePe, Paytm or any UPI app and scan the code to pay{" "}
            <strong>£{total.toLocaleString()}</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (method === "upi") {
    return (
      <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8 space-y-4">
        <h4 className="text-lg font-bold text-[#0F172A]">Pay via UPI ID</h4>
        <p className="text-sm text-slate-600">
          Enter your UPI ID (e.g. name@okhdfcbank) to send a collect request.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
          <button
            disabled={!upiId.includes("@")}
            className="rounded-xl px-5 py-3 text-sm font-bold text-white bg-[#2563EB] disabled:opacity-40"
          >
            Send Request
          </button>
        </div>
        <p className="text-xs text-slate-400">
          You'll get a payment request of £{total.toLocaleString()} on your UPI app to approve.
        </p>
      </div>
    );
  }

  if (method === "debit" || method === "credit") {
    return (
      <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8 space-y-4">
        <h4 className="text-lg font-bold text-[#0F172A]">
          Enter your {method === "debit" ? "Debit" : "Credit"} Card details
        </h4>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Card Number</label>
            <input
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Name on Card</label>
            <input
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              placeholder="Jane Doe"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">Expiry</label>
              <input
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                placeholder="MM/YY"
                maxLength={5}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">CVV</label>
              <input
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                placeholder="123"
                maxLength={4}
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Lock className="size-3" /> Your card details are encrypted and never stored.
        </p>
        <p className="text-[11px] text-amber-600 flex items-start gap-1">
          <AlertCircle className="size-3 mt-0.5 shrink-0" />
          For production, don't submit these raw fields yourself — use a hosted/tokenized card
          field (e.g. Razorpay Card element, Stripe Elements) so card data never touches your
          own servers or state, for PCI-DSS compliance.
        </p>
      </div>
    );
  } */

  /* if (method === "netbank") {
    const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra", "Yes Bank"];
    return (
      <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8 space-y-4">
        <h4 className="text-lg font-bold text-[#0F172A]">Choose your bank</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {banks.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBank(b)}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold text-left transition ${
                selectedBank === b
                  ? "border-[#059669] bg-emerald-50 text-emerald-700"
                  : "border-slate-100 text-slate-700 hover:border-slate-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        {selectedBank && (
          <p className="text-xs text-slate-500">
            You'll be redirected to {selectedBank}'s secure login page to authorize £
            {total.toLocaleString()}.
          </p>
        )}
      </div>
    );
  } */

 /* if (method === "razorpay") {
    return (
      <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8 text-center space-y-3">
        <h4 className="text-lg font-bold text-[#0F172A]">Pay via Razorpay</h4>
        <p className="text-sm text-slate-600">
          Secure checkout powered by Razorpay. Click "Pay Securely" below to continue.
        </p>
      </div>
    );
  } */

  if (method === "wise") {
    return (
      <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <span
            className="grid place-items-center size-11 rounded-xl text-white shadow-md shrink-0"
            style={{ backgroundColor: "#00B9A2" }}
          >
            <Building2 className="size-5" />
          </span>
          <div>
  <h4 className="text-lg font-bold text-[#0F172A]">Pay via Wise Bank Transfer</h4>
  <p className="text-sm text-slate-600 mt-0.5">
    Send £{total.toLocaleString()} to our Wise account using these details, then confirm below.
  </p>
  <a
    href="https://wise.com/in/send-money/send-money-to-india-from-the-uk"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#00B9A2] hover:underline"
  >
    Open Wise <ArrowLeft className="size-3.5 rotate-180" />
  </a>
</div>
        </div>

        {/* Manual Editable Fieldset for Wise Details */}
<fieldset className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
  <legend className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 bg-white rounded-md border border-slate-200">
    Receiving Account Details
  </legend>

  <div className="grid sm:grid-cols-2 gap-4">
    <div>
      <label className="text-xs font-semibold text-slate-500">Account Holder</label>
      <input
        type="text"
        placeholder={WISE_RECEIVING_ACCOUNT.accountHolder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500">Bank Name</label>
      <input
        type="text"
        placeholder={WISE_RECEIVING_ACCOUNT.bankName}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500">Sort Code</label>
      <input
        type="text"
        placeholder={WISE_RECEIVING_ACCOUNT.sortCode}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500">Account Number</label>
      <input
        type="text"
        placeholder={WISE_RECEIVING_ACCOUNT.accountNumber}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div className="sm:col-span-2">
      <label className="text-xs font-semibold text-slate-500">IBAN</label>
      <input
        type="text"
        placeholder={WISE_RECEIVING_ACCOUNT.iban}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div className="sm:col-span-2">
      <label className="text-xs font-semibold text-slate-500">SWIFT / BIC</label>
      <input
        type="text"
        placeholder={WISE_RECEIVING_ACCOUNT.swiftBic}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
  </div>
</fieldset>

        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Important — include this reference
          </p>
          <div className="mt-2">
            <CopyableField label="Payment Reference" value={referenceCode} />
          </div>
          <p className="mt-2 text-xs text-amber-700">
            Without this reference in the transfer notes, we can't automatically match your payment to your order.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            Wise transaction ID or note (optional)
          </label>
          <input
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
            placeholder="e.g. Wise transfer ID"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>

        <p className="text-xs text-slate-400 flex items-start gap-1">
          <Clock className="size-3 mt-0.5 shrink-0" />
          International transfers typically arrive within 1–2 business days. Our team confirms receipt manually and emails you once verified — this isn't instant.
        </p>
      </div>
    );
  }

  if (method === "remitly") {
    return (
      <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <span
            className="grid place-items-center size-11 rounded-xl text-white shadow-md shrink-0"
            style={{ backgroundColor: "#5A3E9E" }}
          >
            <Send className="size-5" />
          </span>
         <div>
  <h4 className="text-lg font-bold text-[#0F172A]">Pay via Remitly</h4>
  <p className="text-sm text-slate-600 mt-0.5">
    Remitly doesn't support automatic merchant confirmation — send £
    {total.toLocaleString()} to the recipient below in the Remitly app, then confirm here.
  </p>
  <a
    href="https://www.remitly.com/gb/en/money-transfer/send-money-to-india"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#5A3E9E] hover:underline"
  >
    Open Remitly <ArrowLeft className="size-3.5 rotate-180" />
  </a>
</div>
        </div>

        {/* Manual Editable Fieldset for Remitly Details */}
        <fieldset className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
  <legend className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 bg-white rounded-md border border-slate-200">
    Recipient Details
  </legend>
  
  <div className="grid sm:grid-cols-2 gap-4">
    <div className="sm:col-span-2">
      <label className="text-xs font-semibold text-slate-500">Recipient Name</label>
      <input
        type="text"
        placeholder={REMITLY_RECIPIENT.recipientName}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500">Recipient Phone</label>
      <input
        type="text"
        placeholder={REMITLY_RECIPIENT.phone}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500">Recipient Country</label>
      <input
        type="text"
        placeholder={REMITLY_RECIPIENT.country}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
      />
    </div>
  </div>
</fieldset>

        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Important — include this reference
          </p>
          <div className="mt-2">
            <CopyableField label="Payment Reference" value={referenceCode} />
          </div>
          <p className="mt-2 text-xs text-amber-700">
            Add this in the Remitly transfer note/purpose field, or send it to us separately by WhatsApp/email so we can match your transfer.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            Remitly transaction reference (optional)
          </label>
          <input
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
            placeholder="e.g. Remitly reference number"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>

        <p className="text-xs text-slate-400 flex items-start gap-1">
          <Clock className="size-3 mt-0.5 shrink-0" />
          Remitly transfers are person-to-person and confirmed manually by our team, usually within one business day of receipt — this isn't instant.
        </p>
      </div>
    );
  }

  // paypal / stripe / intl — redirect-style providers
  const redirectInfo: Record<string, { name: string; color: string }> = {
    stripe: { name: "Stripe", color: "#635BFF" },
  };
  const info = redirectInfo[method];
 if (method === "stripe") {
  return (
    <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-8">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-xl bg-[#635BFF] flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>

        <div>
          <h3 className="text-xl font-bold">
            Customer Details
          </h3>

          <p className="text-sm text-slate-500">
            Enter your details before continuing to Stripe.
          </p>
        </div>

      </div>

      <div className="space-y-5">

        {/* Full Name */}

        <div>

          <label className="block text-sm font-semibold mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={customer.fullName}
            onChange={(e) =>
              setCustomer({
                ...customer,
                fullName: e.target.value,
              })
            }
            placeholder="John Smith"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

        {/* Email */}

        <div>

          <label className="block text-sm font-semibold mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={customer.email}
            onChange={(e) =>
              setCustomer({
                ...customer,
                email: e.target.value,
              })
            }
            placeholder="john@example.com"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

        {/* Phone */}

        <div>

          <label className="block text-sm font-semibold mb-2">
            Phone Number
          </label>

          <input
            type="tel"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({
                ...customer,
                phone: e.target.value,
              })
            }
            placeholder="+44 7700 900123"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">

          <p className="text-sm text-indigo-700">
            After clicking
            <strong> Pay Securely </strong>
            you'll be redirected to Stripe's secure payment page.
          </p>

        </div>

      </div>

    </div>
  );
}
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-bold text-[#0F172A] mt-0.5 truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Clipboard API can fail (e.g. insecure context) — fail silently,
            // the value is still visible/selectable for manual copy.
          }
        }}
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:bg-[#2563EB]/10 transition"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`text-[#0F172A] font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function PaymentSuccess({
  plan,
  duration,
  total,
}: {
  plan: (typeof PLANS)[LevelKey];
  duration: DurationKey;
  total: number;
}) {
  const navigate = useNavigate();
  const receiptId = useMemo(
    () => `PE-${Date.now().toString(36).toUpperCase()}`,
    [],
  );
  return (
    <div className="mt-8 rounded-3xl bg-white shadow-2xl border border-emerald-100 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-white text-center">
        <div className="mx-auto grid place-items-center size-16 rounded-full bg-white/20 backdrop-blur">
          <Check className="size-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Payment Successful</h2>
        <p className="mt-1 text-sm text-white/85">Thank you! Your enrollment is confirmed.</p>
      </div>
      <div className="p-6 space-y-3 text-sm">
        <Row label="Receipt ID" value={receiptId} />
        <Row label="Plan" value={plan.title} />
        <Row label="Duration" value={DURATION_LABELS[duration].label} />
        <Row
          label="Amount Paid"
          value={`£${total.toLocaleString()}`}
          valueClass="text-emerald-600 font-bold text-base"
        />
        <p className="text-xs text-slate-500 pt-2">
          A receipt has been sent to your registered email. Our team will contact you shortly with
          your class schedule.
        </p>
      </div>
      <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() =>
            navigate({
              to: "/schedule",
              search: {
                type: "paid",
                plan_name: plan.title,
                plan_duration: DURATION_LABELS[duration].label,
                plan_amount: total,
              },
            })
          }
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#10B981] px-5 py-3 text-sm font-bold text-white"
        >
          Schedule Your First Class →
        </button>
        <Link
          to="/contact"
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}

// Shown after a Wise or Remitly submission — deliberately NOT styled or worded
// as "Payment Successful", since the transfer hasn't been verified yet. Staff
// confirm manually (see manual-payment-submit / manual-payment-confirm
// Edge Functions) and the customer is emailed once it's actually verified.
function ManualPaymentPending({
  plan,
  duration,
  total,
  referenceCode,
  method,
}: {
  plan: (typeof PLANS)[LevelKey];
  duration: DurationKey;
  total: number;
  referenceCode: string;
  method: "wise" | "remitly";
}) {
  const methodLabel = method === "wise" ? "Wise" : "Remitly";
  return (
    <div className="mt-8 rounded-3xl bg-white shadow-2xl border border-amber-100 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-8 text-white text-center">
        <div className="mx-auto grid place-items-center size-16 rounded-full bg-white/20 backdrop-blur">
          <Clock className="size-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Submitted — Awaiting Confirmation</h2>
        <p className="mt-1 text-sm text-white/90">
          We've recorded your {methodLabel} transfer details. This is not yet a confirmed
          payment.
        </p>
      </div>
      <div className="p-6 space-y-3 text-sm">
        <Row label="Reference Code" value={referenceCode} />
        <Row label="Plan" value={plan.title} />
        <Row label="Duration" value={DURATION_LABELS[duration].label} />
        <Row label="Expected Amount" value={`£${total.toLocaleString()}`} />
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 leading-relaxed">
          Our team checks incoming {methodLabel} transfers against this reference and confirms
          manually — usually within one business day. You'll get an email once it's verified.
          If you haven't sent the transfer yet, please do so now using the reference above.
        </div>
      </div>
      <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
        <a
          href="mailto:support@pushpaedu.com"
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-bold text-white"
        >
          Email Proof of Transfer
        </a>
        <Link
          to="/contact"
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}

/* ============================ QR SVG ============================ */

/*function QrPlaceholder() {
  return (
    <div className="w-40 h-40 md:w-48 md:h-48 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full text-[#0F172A]" fill="currentColor">
        <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="12" y="12" width="11" height="11" fill="currentColor" />
        <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="77" y="12" width="11" height="11" fill="currentColor" />
        <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="12" y="77" width="11" height="11" fill="currentColor" />
        <rect x="37" y="5" width="6" height="6" />
        <rect x="48" y="5" width="6" height="6" />
        <rect x="37" y="16" width="6" height="6" />
        <rect x="55" y="16" width="6" height="6" />
        <rect x="5" y="37" width="6" height="6" />
        <rect x="16" y="48" width="6" height="6" />
        <rect x="37" y="37" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="44" y="44" width="11" height="11" fill="currentColor" />
        <rect x="70" y="37" width="6" height="6" />
        <rect x="82" y="48" width="6" height="6" />
        <rect x="89" y="37" width="6" height="6" />
        <rect x="37" y="70" width="6" height="6" />
        <rect x="48" y="77" width="6" height="6" />
        <rect x="55" y="70" width="6" height="6" />
        <rect x="70" y="70" width="6" height="6" />
        <rect x="82" y="77" width="6" height="6" />
        <rect x="77" y="89" width="6" height="6" />
        <rect x="89" y="82" width="6" height="6" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 rounded-full p-2 shadow-lg border border-slate-100">
          <Check className="size-6 text-[#10B981]" />
        </div>
      </div>
    </div>
  );
}
*/