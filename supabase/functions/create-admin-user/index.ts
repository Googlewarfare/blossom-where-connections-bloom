import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  validateEmail,
  checkDatabaseRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
  RATE_LIMITS,
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-ADMIN-USER] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Rate limiting check (strict for admin creation)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkDatabaseRateLimit(
      supabase,
      clientId,
      RATE_LIMITS.create_admin
    );
    
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(corsHeaders, RATE_LIMITS.create_admin.windowSeconds);
    }

    const adminEmail = "admin@blossom.app";
    
    const emailResult = validateEmail(adminEmail);
    if (!emailResult.success) {
      logStep("ERROR: Invalid admin email", { errors: emailResult.errors });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid admin email configuration",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const tempPassword = crypto.randomUUID().slice(0, 16) + "Aa1!";

    logStep("Checking for existing admin user");

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(
      (u) => u.email === adminEmail
    );

    if (existingAdmin) {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .single();

      if (existingRole) {
        logStep("Admin user already exists with admin role");
        return new Response(
          JSON.stringify({
            success: false,
            message: "Admin user already exists",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: existingAdmin.id,
        role: "admin",
      });

      if (roleError) {
        logStep("ERROR: Failed to add admin role", { error: roleError.message });
        throw roleError;
      }

      logStep("Admin role added to existing user");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Admin role added to existing user",
          email: adminEmail,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logStep("Creating new admin user");

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: tempPassword,
        email_confirm: true,
      });

    if (createError) {
      logStep("ERROR: Failed to create admin user", { error: createError.message });
      throw createError;
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "admin",
    });

    if (roleError) {
      logStep("ERROR: Failed to assign admin role", { error: roleError.message });
      throw roleError;
    }

    logStep("Admin user created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        email: adminEmail,
        temporaryPassword: tempPassword,
        note: "Please change this password immediately after logging in!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message });
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to create admin user",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
