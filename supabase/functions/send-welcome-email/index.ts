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

    // Verify JWT and get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");
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

    // Get user profile
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

    // Get user email from auth
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

    const firstName = profile?.full_name?.split(" ")[0] || "there";
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
              
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #9B2C4D 100%); border-radius: 24px 24px 0 0; padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; left: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -30px; right: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                
                <div style="font-size: 60px; margin-bottom: 16px;">💕</div>
                <h1 style="color: #ffffff; font-size: 36px; font-weight: 800; margin: 0 0 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  Welcome to Blossom
                </h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 500;">
                  Where meaningful connections bloom 🌸
                </p>
              </div>

              <!-- Main Content -->
              <div style="background: #ffffff; padding: 40px 35px; border-radius: 0 0 24px 24px; box-shadow: 0 20px 60px rgba(196, 69, 105, 0.15);">
                
                <h2 style="color: #1a1a2e; font-size: 28px; font-weight: 700; margin: 0 0 20px; text-align: center;">
                  Hey ${firstName}! 👋
                </h2>
                
                <p style="color: #4a4a5a; font-size: 17px; line-height: 1.7; margin: 0 0 24px; text-align: center;">
                  <strong style="color: #C44569;">You just took the first step</strong> toward finding someone special. 
                  We're so excited to have you here!
                </p>

                <!-- Exciting Stats Box -->
                <div style="background: linear-gradient(135deg, #FFF5F7 0%, #FFE8EE 100%); border-radius: 16px; padding: 28px; margin: 24px 0; border: 2px solid #FFD0DC;">
                  <p style="color: #C44569; font-size: 16px; font-weight: 700; margin: 0 0 16px; text-align: center;">
                    ✨ Join thousands finding love every day ✨
                  </p>
                  <div style="display: flex; justify-content: space-around; text-align: center;">
                    <div style="flex: 1;">
                      <div style="font-size: 32px; font-weight: 800; color: #C44569;">10K+</div>
                      <div style="font-size: 12px; color: #666; margin-top: 4px;">Active Members</div>
                    </div>
                    <div style="flex: 1;">
                      <div style="font-size: 32px; font-weight: 800; color: #C44569;">500+</div>
                      <div style="font-size: 12px; color: #666; margin-top: 4px;">Matches Daily</div>
                    </div>
                    <div style="flex: 1;">
                      <div style="font-size: 32px; font-weight: 800; color: #C44569;">98%</div>
                      <div style="font-size: 12px; color: #666; margin-top: 4px;">Happy Users</div>
                    </div>
                  </div>
                </div>

                <!-- Steps Section -->
                <h3 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 32px 0 20px; text-align: center;">
                  🚀 Get Started in 3 Easy Steps
                </h3>

                <div style="margin: 20px 0;">
                  <!-- Step 1 -->
                  <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 15px rgba(196, 69, 105, 0.3);">
                      <span style="color: #fff; font-size: 20px; font-weight: 700;">1</span>
                    </div>
                    <div style="margin-left: 16px; padding-top: 4px;">
                      <p style="color: #1a1a2e; font-size: 16px; font-weight: 700; margin: 0 0 4px;">Add Your Best Photos 📸</p>
                      <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">Show off your smile! Profiles with 4+ photos get 3x more matches.</p>
                    </div>
                  </div>

                  <!-- Step 2 -->
                  <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 15px rgba(196, 69, 105, 0.3);">
                      <span style="color: #fff; font-size: 20px; font-weight: 700;">2</span>
                    </div>
                    <div style="margin-left: 16px; padding-top: 4px;">
                      <p style="color: #1a1a2e; font-size: 16px; font-weight: 700; margin: 0 0 4px;">Share Your Story 💬</p>
                      <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">Write a bio that shows your personality. Be authentic - that's what attracts the right person!</p>
                    </div>
                  </div>

                  <!-- Step 3 -->
                  <div style="display: flex; align-items: flex-start;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 15px rgba(196, 69, 105, 0.3);">
                      <span style="color: #fff; font-size: 20px; font-weight: 700;">3</span>
                    </div>
                    <div style="margin-left: 16px; padding-top: 4px;">
                      <p style="color: #1a1a2e; font-size: 16px; font-weight: 700; margin: 0 0 4px;">Start Discovering 💕</p>
                      <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">Swipe through profiles, find your match, and start meaningful conversations!</p>
                    </div>
                  </div>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 36px 0;">
                  <a href="${profileUrl}" style="background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%); color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; display: inline-block; padding: 18px 48px; border-radius: 50px; box-shadow: 0 8px 30px rgba(196, 69, 105, 0.4); transition: all 0.3s ease;">
                    ✨ Complete My Profile ✨
                  </a>
                </div>

                <!-- Motivational Quote -->
                <div style="background: #1a1a2e; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
                  <p style="color: #FF6B9D; font-size: 20px; font-style: italic; margin: 0 0 8px; font-weight: 500;">
                    "The best love stories start with a single hello."
                  </p>
                  <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                    Your next chapter begins today 💫
                  </p>
                </div>

                <!-- Features Grid -->
                <h3 style="color: #1a1a2e; font-size: 18px; font-weight: 700; margin: 28px 0 16px; text-align: center;">
                  🎁 What Makes Blossom Special
                </h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div style="background: #F8F9FA; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; margin-bottom: 8px;">🔒</div>
                    <p style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Verified Profiles</p>
                    <p style="color: #666; font-size: 12px; margin: 0;">Real people, real connections</p>
                  </div>
                  <div style="background: #F8F9FA; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; margin-bottom: 8px;">🎯</div>
                    <p style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Smart Matching</p>
                    <p style="color: #666; font-size: 12px; margin: 0;">AI-powered compatibility</p>
                  </div>
                  <div style="background: #F8F9FA; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; margin-bottom: 8px;">📹</div>
                    <p style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Video Dates</p>
                    <p style="color: #666; font-size: 12px; margin: 0;">Meet before you meet</p>
                  </div>
                  <div style="background: #F8F9FA; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; margin-bottom: 8px;">🌟</div>
                    <p style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Daily Questions</p>
                    <p style="color: #666; font-size: 12px; margin: 0;">Fun icebreakers</p>
                  </div>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">

                <!-- Closing -->
                <p style="color: #4a4a5a; font-size: 16px; line-height: 1.7; margin: 0 0 20px; text-align: center;">
                  Remember, every great love story started somewhere. 
                  <strong style="color: #C44569;">Yours starts here.</strong>
                </p>

                <p style="color: #1a1a2e; font-size: 16px; text-align: center; margin: 0;">
                  With love,<br>
                  <strong style="color: #C44569;">💕 The Blossom Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="padding: 24px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px;">
                  You received this email because you joined Blossom.
                </p>
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2025 Blossom. Made with 💕 for people seeking love.
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
      },
    );
  }
};

serve(handler);
