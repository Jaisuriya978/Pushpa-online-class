// supabase/functions/razorpay-create-order/index.ts
//
// Creates a Razorpay order server-side and records a 'created' row in the
// `payments` table. Never expose RAZORPAY_KEY_SECRET to the client.
//
// Required secrets (set with `supabase secrets set`):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
// These are already present by default on every Supabase project:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Deploy:
//   supabase functions deploy razorpay-create-order
//
// Call from the client:
//   POST {SUPABASE_FUNCTIONS_URL}/razorpay-create-order
//   body: {
//     amount: number (major units, e.g. GBP pounds),
//     currency: "GBP",
//     plan_level: "y28" | "y9g" | "asa",
//     plan_title: string,
//     duration: string,
//     customer_name?: string,
//     customer_email?: string,
//     customer_phone?: string,
//     notes?: Record<string,string>
//   }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
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
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured on the server.");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials are not configured on the server.");
    }

    const body = await req.json();
    const {
      amount,
      currency = "GBP",
      plan_level,
      plan_title,
      duration,
      customer_name,
      customer_email,
      customer_phone,
      notes,
    } = body ?? {};

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "A valid positive 'amount' is required." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    if (!plan_level || !plan_title || !duration) {
      return new Response(
        JSON.stringify({ error: "'plan_level', 'plan_title' and 'duration' are required." }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Razorpay expects amount in the smallest currency unit (e.g. pence for GBP).
    const amountInMinorUnits = Math.round(amount * 100);
    const receipt = `receipt_${Date.now()}`;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: amountInMinorUnits,
        currency,
        receipt,
        notes: notes ?? {},
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error("Razorpay order creation failed:", order);
      return new Response(
        JSON.stringify({ error: order?.error?.description ?? "Failed to create order" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Record the pending order in Supabase using the service role key
    // (bypasses RLS — this is a trusted server context).
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: dbError } = await supabase.from("payments").insert({
      razorpay_order_id: order.id,
      plan_level,
      plan_title,
      duration,
      amount,
      currency,
      customer_name: customer_name ?? null,
      customer_email: customer_email ?? null,
      customer_phone: customer_phone ?? null,
      status: "created",
      notes: notes ?? {},
    });

    if (dbError) {
      // The Razorpay order already exists at this point. Don't fail the whole
      // request over a DB write issue — log it loudly so it can be reconciled,
      // but still let the client proceed to checkout.
      console.error("Failed to persist payment row:", dbError);
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("razorpay-create-order error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message ?? "Internal error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});