import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PASSWORD-RESET] ${step}${detailsStr}`);
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, resetLink }: PasswordResetRequest = await req.json();

    if (!email || !resetLink) {
      logStep("ERROR: Missing required fields");
      return new Response(JSON.stringify({ error: "Email and reset link are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    logStep("Sending password reset email");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Blossom</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FFF5F7;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5F7; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">🔒 Reset Your Password</h1>
                    </td>
                  </tr>
                  
                  <!-- Main content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your Blossom account. Click the button below to create a new password.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%); color: #FFFFFF; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Info box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF3C7; border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.5;">
                              <strong>⚡ Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this reset, you can safely ignore this email.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; color: #EC4899; font-size: 12px; word-break: break-all;">
                        ${resetLink}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">
                        💖 Find your perfect match with Blossom
                      </p>
                      <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                        © 2024 Blossom. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Blossom <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - Blossom",
      html: htmlContent,
    });

    logStep("Password reset email sent successfully");

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
      JSON.stringify({ error: "Failed to send password reset email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
