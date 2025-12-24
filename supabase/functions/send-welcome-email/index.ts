import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify JWT and get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !authData.user) {
      logStep("ERROR: Authentication failed", { error: authError?.message });
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const callerUserId = authData.user.id;
    logStep("User authenticated", { userId: callerUserId });

    const { userId }: WelcomeEmailRequest = await req.json();

    if (!userId) {
      logStep("ERROR: Missing user ID");
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Authorization check: User can only send welcome email to themselves
    // This prevents abuse where someone could spam emails to other users
    if (callerUserId !== userId) {
      // Check if caller is an admin
      const { data: hasAdminRole } = await supabaseAdmin.rpc('has_role', { 
        _user_id: callerUserId, 
        _role: 'admin' 
      });
      
      if (!hasAdminRole) {
        logStep("ERROR: Unauthorized - user trying to send email to different user", { 
          callerId: callerUserId, 
          targetId: userId 
        });
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      logStep("Admin sending welcome email to user", { adminId: callerUserId, targetId: userId });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      logStep("ERROR: Failed to fetch profile", { error: profileError.message });
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      logStep("ERROR: Failed to fetch user", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const firstName = profile?.full_name?.split(" ")[0] || "there";
    const profileUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || ""}/profile`;

    logStep("Sending welcome email", { recipientEmail: user.email });

    await resend.emails.send({
      from: "Blossom <onboarding@resend.dev>",
      to: [user.email!],
      subject: "Welcome to Blossom! 🌸",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                background-color: #f9fafb;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
                padding: 40px 20px;
                text-align: center;
                border-radius: 12px 12px 0 0;
              }
              .header-text {
                color: #ffffff;
                font-size: 32px;
                font-weight: bold;
                margin: 0;
              }
              .content {
                background: #ffffff;
                padding: 40px 30px;
                border-radius: 0 0 12px 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .title {
                color: #1f2937;
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 20px;
                line-height: 1.3;
              }
              .paragraph {
                color: #4b5563;
                font-size: 16px;
                line-height: 1.6;
                margin: 16px 0;
              }
              .highlight-box {
                background-color: #fef3f6;
                border: 2px solid #FF6B9D;
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
              }
              .highlight-title {
                color: #C06C84;
                font-size: 18px;
                font-weight: bold;
                margin: 0 0 12px;
              }
              .list-item {
                color: #4b5563;
                font-size: 15px;
                line-height: 1.8;
                margin: 8px 0;
                padding-left: 4px;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                background-color: #FF6B9D;
                border-radius: 8px;
                color: #ffffff;
                font-size: 16px;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                padding: 14px 32px;
                box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
              }
              .hr {
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 24px 0;
              }
              .small-text {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
                margin: 6px 0;
              }
              .signature {
                color: #4b5563;
                font-size: 16px;
                line-height: 1.6;
                margin: 24px 0 0;
              }
              .footer {
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                margin-top: 20px;
              }
              .footer-text {
                color: #9ca3af;
                font-size: 12px;
                line-height: 1.5;
                margin: 4px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Header -->
              <div class="header">
                <h1 class="header-text">🌸 Blossom</h1>
              </div>

              <!-- Content -->
              <div class="content">
                <h1 class="title">Welcome to Blossom, ${firstName}!</h1>
                
                <p class="paragraph">
                  We're thrilled to have you join our community! Your journey to meaningful 
                  connections starts now.
                </p>

                <div class="highlight-box">
                  <p class="highlight-title">✨ What's Next?</p>
                  <p class="list-item">📸 Complete your profile with photos</p>
                  <p class="list-item">💝 Add your interests and preferences</p>
                  <p class="list-item">🗺️ Start discovering amazing people nearby</p>
                  <p class="list-item">💕 Begin your journey to finding love</p>
                </div>

                <!-- CTA Button -->
                <div class="button-container">
                  <a href="${profileUrl}" class="button">
                    Complete Your Profile
                  </a>
                </div>

                <p class="paragraph">
                  Ready to make your profile shine? Add photos, share your interests, and 
                  let others know what makes you unique.
                </p>

                <hr class="hr">

                <p class="small-text"><strong>💡 Pro Tips:</strong></p>
                <p class="small-text">• Use high-quality photos that show your personality</p>
                <p class="small-text">• Be authentic in your bio - it helps find better matches</p>
                <p class="small-text">• Set your preferences to find people you'll truly connect with</p>

                <hr class="hr">

                <p class="paragraph">
                  If you have any questions or need help getting started, we're here for you!
                </p>

                <p class="signature">
                  Happy matching! 💕<br>
                  <strong>The Blossom Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p class="footer-text">
                  You're receiving this email because you signed up for Blossom.
                </p>
                <p class="footer-text">
                  © 2025 Blossom. All rights reserved.
                </p>
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
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: "Failed to send welcome email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
