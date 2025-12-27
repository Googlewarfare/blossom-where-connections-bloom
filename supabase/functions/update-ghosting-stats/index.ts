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
    console.log("Starting ghosting stats update...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Detect and record ghosting patterns
    console.log("Running detect_and_record_ghosting...");
    const { error: ghostingError } = await supabase.rpc("detect_and_record_ghosting");
    
    if (ghostingError) {
      console.error("Error detecting ghosting:", ghostingError);
      throw ghostingError;
    }
    console.log("Ghosting detection complete");

    // Step 2: Get stats for logging
    const { data: statsData, error: statsError } = await supabase
      .from("user_response_patterns")
      .select("user_id, ghosted_count, graceful_closures, visibility_score")
      .gt("ghosted_count", 0);

    if (statsError) {
      console.error("Error fetching stats:", statsError);
    } else {
      console.log(`Found ${statsData?.length || 0} users with ghosting history`);
      
      // Log users with reduced visibility
      const reducedVisibility = statsData?.filter(u => u.visibility_score < 1.0) || [];
      console.log(`Users with reduced visibility: ${reducedVisibility.length}`);
      
      if (reducedVisibility.length > 0) {
        console.log("Visibility score distribution:");
        const distribution = {
          "0.3-0.5": reducedVisibility.filter(u => u.visibility_score >= 0.3 && u.visibility_score < 0.5).length,
          "0.5-0.7": reducedVisibility.filter(u => u.visibility_score >= 0.5 && u.visibility_score < 0.7).length,
          "0.7-0.9": reducedVisibility.filter(u => u.visibility_score >= 0.7 && u.visibility_score < 0.9).length,
          "0.9-1.0": reducedVisibility.filter(u => u.visibility_score >= 0.9 && u.visibility_score < 1.0).length,
        };
        console.log(JSON.stringify(distribution));
      }
    }

    // Step 3: Update trust signals for users with pattern changes
    console.log("Updating trust signals...");
    const { data: patternsData } = await supabase
      .from("user_response_patterns")
      .select("user_id")
      .order("last_calculated_at", { ascending: false })
      .limit(100);

    if (patternsData && patternsData.length > 0) {
      for (const pattern of patternsData) {
        const { error: trustError } = await supabase.rpc("calculate_trust_signals", {
          p_user_id: pattern.user_id,
        });
        if (trustError) {
          console.error(`Error updating trust signals for ${pattern.user_id}:`, trustError);
        }
      }
      console.log(`Updated trust signals for ${patternsData.length} users`);
    }

    const response = {
      success: true,
      message: "Ghosting stats updated successfully",
      stats: {
        usersWithGhosting: statsData?.length || 0,
        usersWithReducedVisibility: statsData?.filter(u => u.visibility_score < 1.0).length || 0,
        trustSignalsUpdated: patternsData?.length || 0,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Ghosting stats update complete:", JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in update-ghosting-stats:", errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});