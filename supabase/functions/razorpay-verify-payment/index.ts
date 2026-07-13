// supabase/functions/razorpay-verify-payment/index.ts
//
// Verifies the HMAC-SHA256 signature Razorpay returns to the client's checkout
// `handler` callback, then updates the matching `payments` row to 'paid' (or
// 'verification_failed'). NEVER trust razorpay_payment_id / order_id / signature
// from the client without running this check — anyone can fabricate a "success"
// callback in the browser otherwise.
//
// Required secrets:
//   RAZORPAY_KEY_SECRET
// Already present by default:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Deploy:
//   supabase functions deploy razorpay-verify-payment
//
// Call from the client (inside the Razorpay `handler` callback):
//   POST {SUPABASE_FUNCTIONS_URL}/razorpay-verify-payment
//   body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHmac } from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // tighten to your FRONTEND_URL in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret is not configured on the server.");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials are not configured on the server.");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Razorpay's documented verification formula:
    //   expected_signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;

    if (!verified) {
      console.warn("Razorpay signature mismatch", { razorpay_order_id, razorpay_payment_id });

      await supabase
        .from("payments")
        .update({
          status: "verification_failed",
          razorpay_payment_id,
          razorpay_signature,
        })
        .eq("razorpay_order_id", razorpay_order_id);

      return new Response(JSON.stringify({ verified: false, error: "Signature mismatch." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Signature verified — mark the payment as paid.
    const { error: dbError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (dbError) {
      console.error("Failed to update payment row after verification:", dbError);
      // The payment IS genuinely verified at this point — don't tell the client
      // it failed just because of a DB write issue. Log loudly for reconciliation.
    }

    // TODO: trigger your existing send-email Edge Function here to send the
    // receipt, now that the payment is confirmed genuine.

    return new Response(JSON.stringify({ verified: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("razorpay-verify-payment error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message ?? "Internal error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});