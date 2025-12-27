import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role client to create user
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminEmail = "admin@blossom.app";
    // Generate a secure temporary password
    const tempPassword = crypto.randomUUID().slice(0, 16) + "Aa1!";

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(
      (u) => u.email === adminEmail
    );

    if (existingAdmin) {
      // Check if already has admin role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .single();

      if (existingRole) {
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

      // Add admin role to existing user
      await supabase.from("user_roles").insert({
        user_id: existingAdmin.id,
        role: "admin",
      });

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

    // Create new admin user
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: tempPassword,
        email_confirm: true,
      });

    if (createError) {
      throw createError;
    }

    // Assign admin role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "admin",
    });

    if (roleError) {
      throw roleError;
    }

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
    console.error("Error creating admin:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
