import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  validateUuid,
  parseRequestBody,
  validateAuthHeader,
  sanitizeString,
  checkDatabaseRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
  RATE_LIMITS,
} from "../_shared/validation.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

interface WelcomeEmailRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authResult = validateAuthHeader(req.headers.get("Authorization"));
    if (!authResult.success) {
      logStep("ERROR: Invalid authorization", { errors: authResult.errors });
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const token = authResult.data!;
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      logStep("ERROR: Authentication failed", { error: authError?.message });
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const callerUserId = authData.user.id;
    logStep("User authenticated", { userId: callerUserId });

    // Rate limiting check
    const clientId = getClientIdentifier(req, callerUserId);
    const rateLimitResult = await checkDatabaseRateLimit(
      supabaseAdmin,
      clientId,
      RATE_LIMITS.welcome_email
    );
    
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(corsHeaders, RATE_LIMITS.welcome_email.windowSeconds);
    }

    const bodyResult = await parseRequestBody<WelcomeEmailRequest>(req);
    if (!bodyResult.success) {
      logStep("ERROR: Invalid request body", { errors: bodyResult.errors });
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const { userId } = bodyResult.data!;

    const userIdResult = validateUuid(userId, "userId");
    if (!userIdResult.success) {
      logStep("ERROR: Invalid userId", { errors: userIdResult.errors });
      return new Response(
        JSON.stringify({ error: "Invalid user ID format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (callerUserId !== userId) {
      const { data: hasAdminRole } = await supabaseAdmin.rpc("has_role", {
        _user_id: callerUserId,
        _role: "admin",
      });

      if (!hasAdminRole) {
        logStep(
          "ERROR: Unauthorized - user trying to send email to different user",
          {
            callerId: callerUserId,
            targetId: userId,
          },
        );
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      logStep("Admin sending welcome email to user", {
        adminId: callerUserId,
        targetId: userId,
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      logStep("ERROR: Failed to fetch profile", {
        error: profileError.message,
      });
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      logStep("ERROR: Failed to fetch user", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const rawFirstName = profile?.full_name?.split(" ")[0] || "there";
    const firstName = sanitizeString(rawFirstName);
    const profileUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || ""}/profile`;

    logStep("Sending welcome email", { recipientEmail: user.email });

    await resend.emails.send({
      from: "Blossom <team@myblossom.app>",
      to: [user.email!],
      subject: "💕 Your Love Story Begins Now - Welcome to Blossom!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(180deg, #FFF5F7 0%, #FFFFFF 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #9B2C4D 100%); border-radius: 24px 24px 0 0; padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; left: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -30px; right: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="font-size: 60px; margin-bottom: 16px;">💕</div>
                <h1 style="color: #ffffff; font-size: 36px; font-weight: 800; margin: 0 0 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">Welcome to Blossom</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 500;">Where meaningful connections bloom 🌸</p>
              </div>
              <div style="background: #ffffff; padding: 40px 35px; border-radius: 0 0 24px 24px; box-shadow: 0 20px 60px rgba(196, 69, 105, 0.15);">
                <h2 style="color: #1a1a2e; font-size: 28px; font-weight: 700; margin: 0 0 20px; text-align: center;">Hey ${firstName}! 👋</h2>
                <p style="color: #4a4a5a; font-size: 17px; line-height: 1.7; margin: 0 0 24px; text-align: center;">
                  <strong style="color: #C44569;">You just took the first step</strong> toward finding someone special. We're so excited to have you here!
                </p>
                <div style="text-align: center; margin: 36px 0;">
                  <a href="${profileUrl}" style="background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%); color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; display: inline-block; padding: 18px 48px; border-radius: 50px; box-shadow: 0 8px 30px rgba(196, 69, 105, 0.4);">
                    ✨ Complete My Profile ✨
                  </a>
                </div>
                <p style="color: #1a1a2e; font-size: 16px; text-align: center; margin: 0;">
                  With love,<br><strong style="color: #C44569;">💕 The Blossom Team</strong>
                </p>
              </div>
              <div style="padding: 24px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px;">You received this email because you joined Blossom.</p>
                <p style="color: #999; font-size: 12px; margin: 0;">© 2025 Blossom. Made with 💕 for people seeking love.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    logStep("Welcome email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: "Failed to send welcome email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
