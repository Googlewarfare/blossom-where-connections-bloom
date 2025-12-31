import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  validateString,
  parseRequestBody,
  validateAuthHeader,
  checkDatabaseRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
  RATE_LIMITS,
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
};

const ALLOWED_PRICE_IDS = [
  "price_1ShsZ5D2qFqWAuNmmh2UjMgz", // Blossom Premium monthly
  "price_1SZdbTD2qFqWAuNmlGZjaNdE", // Blossom Premium yearly
  "price_1SkCwTD2qFqWAuNmu8XaPFLH", // Intentional Membership monthly
];

interface SubscriptionRequest {
  priceId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    logStep("Function started");

    const authResult = validateAuthHeader(req.headers.get("Authorization"));
    if (!authResult.success) {
      logStep("ERROR: Invalid authorization", { errors: authResult.errors });
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const token = authResult.data!;
    const { data, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !data.user?.email) {
      logStep("ERROR: Authentication failed", { error: authError?.message });
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const user = data.user;
    logStep("User authenticated", { userId: user.id });

    // Rate limiting check
    const clientId = getClientIdentifier(req, user.id);
    const rateLimitResult = await checkDatabaseRateLimit(
      supabaseClient,
      clientId,
      RATE_LIMITS.checkout
    );
    
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(corsHeaders, RATE_LIMITS.checkout.windowSeconds);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: Stripe key not configured");
      return new Response(
        JSON.stringify({ error: "Payment service unavailable" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        },
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Stripe customer lookup complete", {
      customerId: customerId || "new customer",
    });

    const bodyResult = await parseRequestBody<SubscriptionRequest>(req);
    let priceId = ALLOWED_PRICE_IDS[0];

    if (bodyResult.success && bodyResult.data?.priceId) {
      const priceIdResult = validateString(bodyResult.data.priceId, "priceId", {
        minLength: 10,
        maxLength: 100,
      });

      if (priceIdResult.success && priceIdResult.data) {
        if (!ALLOWED_PRICE_IDS.includes(priceIdResult.data)) {
          logStep("ERROR: Invalid price ID", { priceId: priceIdResult.data });
          return new Response(
            JSON.stringify({ error: "Invalid price ID" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            },
          );
        }
        priceId = priceIdResult.data;
      }
    }

    logStep("Creating checkout session", { priceId });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/premium?subscription_success=true`,
      cancel_url: `${origin}/premium`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
