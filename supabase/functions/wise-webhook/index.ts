// Supabase Edge Function: wise-webhook
//
// Receives balances#update events from Wise and auto-confirms matching
// manual_payments rows by reference_code. Falls back to leaving the row
// "pending" for human review if nothing matches or amounts don't line up.
//
// Deploy: supabase functions deploy wise-webhook --no-verify-jwt
//   (--no-verify-jwt because Wise calls this directly, not via your app's auth)
//
// Env needed (`supabase secrets set`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   WISE_WEBHOOK_PUBLIC_KEY — the PEM public key from
//     https://docs.wise.com/guides/developer/webhooks/event-handling
//     (use the sandbox key while testing, the live key in production)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WISE_PUBLIC_KEY_PEM = Deno.env.get("WISE_WEBHOOK_PUBLIC_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 1. Read the RAW body — signature is computed over the exact bytes sent,
  //    so parse it as JSON only AFTER verifying.
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-signature-sha256");

  if (!signatureHeader) {
    return new Response("Missing signature", { status: 400 });
  }

  const validSignature = await verifyWiseSignature(rawBody, signatureHeader);
  if (!validSignature) {
    console.error("wise-webhook: signature verification failed");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Wise sends a test event when a subscription is first created — just ack it.
  if (req.headers.get("x-test-notification") === "true") {
    return new Response("ok", { status: 200 });
  }

  try {
    if (
      event.event_type === "balances#update" &&
      event.data?.transaction_type === "credit"
    ) {
      const { amount, currency, transfer_reference } = event.data;

      if (transfer_reference) {
        const { data: match, error } = await supabase
          .from("manual_payments")
          .select("*")
          .eq("method", "wise")
          .eq("status", "pending")
          .eq("reference_code", transfer_reference)
          .maybeSingle();

        if (error) {
          console.error("wise-webhook lookup error", error);
        } else if (match) {
          const amountMatches = Number(match.amount) === Number(amount);
          const currencyMatches = match.currency === currency;

          await supabase
            .from("manual_payments")
            .update({
              status: amountMatches && currencyMatches ? "confirmed" : "needs_review",
              confirmed_at: new Date().toISOString(),
              wise_event: event, // keep raw event for auditing/debugging
            })
            .eq("id", match.id);
        }
        // If no match: leave it pending. Your team still confirms manually,
        // this just means an unexpected/late/mismatched transfer came in.
      }
    }

    // ALWAYS return 2xx quickly (Wise requires a response within 5s and
    // retries up to 25 times over 2 weeks otherwise).
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("wise-webhook processing error", err);
    // Still return 200 if you've already safely stored/ignored the event —
    // only return 5xx if you genuinely need Wise to retry delivery.
    return new Response("ok", { status: 200 });
  }
});

async function verifyWiseSignature(
  rawBody: string,
  signatureHeaderB64: string,
): Promise<boolean> {
  try {
    const pemBody = WISE_PUBLIC_KEY_PEM.replace(
      /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g,
      "",
    );
    const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

    const publicKey = await crypto.subtle.importKey(
      "spki",
      keyBytes,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signatureBytes = Uint8Array.from(
      atob(signatureHeaderB64),
      (c) => c.charCodeAt(0),
    );
    const dataBytes = new TextEncoder().encode(rawBody);

    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      signatureBytes,
      dataBytes,
    );
  } catch (err) {
    console.error("signature verification threw", err);
    return false;
  }
}