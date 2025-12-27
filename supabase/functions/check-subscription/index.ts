import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  validateAuthHeader,
  validateEmail,
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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

type JwtPayload = {
  sub?: string;
  email?: string;
  [key: string]: unknown;
};

const decodeJwtPayload = (jwt: string): JwtPayload | null => {
  try {
    const parts = jwt.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const json = atob(padded);
    const payload = JSON.parse(json);

    return typeof payload === "object" && payload ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
};

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

    // Validate authorization header
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    const authResult = validateAuthHeader(authHeader);
    if (!authResult.success) {
      logStep("ERROR: Invalid authorization", { errors: authResult.errors });
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authResult.data!;
    logStep("Authenticating user", { tokenLength: token.length });

    const payload = decodeJwtPayload(token);
    const userId = payload?.sub;
    const email = payload?.email;

    if (!userId) {
      logStep("ERROR: Missing user ID in JWT");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const emailResult = validateEmail(email);
    if (!emailResult.success) {
      logStep("ERROR: Invalid email in JWT", { errors: emailResult.errors });
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId });

    // Rate limiting check
    const clientId = getClientIdentifier(req, userId);
    const rateLimitResult = await checkDatabaseRateLimit(
      supabaseClient,
      clientId,
      RATE_LIMITS.subscription
    );
    
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(corsHeaders, RATE_LIMITS.subscription.windowSeconds);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({
      email: emailResult.data!,
      limit: 1,
    });

    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });
    const hasActiveSub = subscriptions.data.length > 0;

    const activeProducts = subscriptions.data.map((sub: Stripe.Subscription) => ({
      product_id: sub.items.data[0].price.product as string,
      subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
      subscription_id: sub.id,
    }));

    if (hasActiveSub) {
      logStep("Active subscriptions found", { count: activeProducts.length });
    } else {
      logStep("No active subscription found");
    }

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        subscriptions: activeProducts,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: "Failed to check subscription status" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
