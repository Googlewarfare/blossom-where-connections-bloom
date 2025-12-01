import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: WelcomeEmailRequest = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      throw userError;
    }

    const firstName = profile?.full_name?.split(" ")[0] || "there";

    const emailResponse = await resend.emails.send({
      from: "Blossom <onboarding@resend.dev>",
      to: [user.email!],
      subject: "Welcome to Blossom! 🌸",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
                padding: 40px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .header h1 {
                color: white;
                margin: 0;
                font-size: 28px;
              }
              .content {
                background: #ffffff;
                padding: 40px 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .button {
                display: inline-block;
                padding: 14px 28px;
                background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Welcome to Blossom! 🌸</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              <p>We're thrilled to have you join the Blossom community! Your journey to meaningful connections starts now.</p>
              
              <p><strong>Here's what you can do next:</strong></p>
              <ul>
                <li>Complete your profile with photos and interests</li>
                <li>Set your matching preferences</li>
                <li>Start discovering amazing people nearby</li>
              </ul>
              
              <p>Ready to get started?</p>
              
              <a href="${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || ""}/profile" class="button">
                Complete Your Profile
              </a>
              
              <p>If you have any questions or need help, feel free to reach out to our support team.</p>
              
              <p>Happy matching! 💕</p>
              <p><strong>The Blossom Team</strong></p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you signed up for Blossom.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
