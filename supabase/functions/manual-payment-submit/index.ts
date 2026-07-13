// Supabase Edge Function: manual-payment-submit
//
// Called by the frontend when a user submits a Wise or Remitly transfer for
// manual confirmation. This ONLY records a pending record — it never marks
// an order as paid. A human on your team must check their Wise/Remitly
// account, match the reference_code, and confirm separately (e.g. via the
// Supabase dashboard, or a small companion "manual-payment-confirm" function
// you trigger yourself).
//
// Deploy: supabase functions deploy manual-payment-submit
// Env needed (set via `supabase secrets set`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional) NOTIFY_EMAIL_WEBHOOK_URL — e.g. a Slack/Resend webhook so
//   your team gets pinged immediately instead of having to poll the table.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTIFY_WEBHOOK_URL = Deno.env.get("NOTIFY_EMAIL_WEBHOOK_URL"); // optional

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // tighten to your domain in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      method,          // "wise" | "remitly"
      plan_level,
      plan_title,
      duration,
      amount,
      currency,
      reference_code,
      sender_note,
    } = body ?? {};

    if (!method || !["wise", "remitly"].includes(method)) {
      return json({ error: "Invalid or missing method" }, 400);
    }
    if (!reference_code || !amount || !currency) {
      return json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase
      .from("manual_payments")
      .insert({
        method,
        plan_level,
        plan_title,
        duration,
        amount,
        currency,
        reference_code,
        sender_note,
        status: "pending", // pending | confirmed | rejected
      })
      .select()
      .single();

    if (error) {
      console.error("manual_payments insert error", error);
      return json({ error: "Could not save submission" }, 500);
    }

    // Best-effort notification — failure here should not fail the request,
    // the record is already saved and staff can still find it in the table.
    if (NOTIFY_WEBHOOK_URL) {
      try {
        await fetch(NOTIFY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text:
              `New ${method.toUpperCase()} payment submitted — ` +
              `${currency} ${amount} — ref ${reference_code} — ${plan_title} (${duration})`,
          }),
        });
      } catch (notifyErr) {
        console.error("notify webhook failed", notifyErr);
      }
    }

    return json({ submitted: true, id: data.id });
  } catch (err) {
    console.error("manual-payment-submit error", err);
    return json({ error: "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}