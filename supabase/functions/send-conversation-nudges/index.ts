import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InactiveConversation {
  conversation_id: string;
  user_to_nudge: string;
  other_user_id: string;
  other_user_name: string;
  last_message_at: string;
  days_inactive: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find conversations where user hasn't responded in 3+ days
    // but the other person sent the last message
    const { data: inactiveConversations, error: queryError } = await supabase.rpc(
      "get_conversations_needing_nudge"
    );

    if (queryError) {
      console.error("Error fetching inactive conversations:", queryError);
      throw queryError;
    }

    console.log(`Found ${inactiveConversations?.length || 0} conversations needing nudges`);

    let nudgesSent = 0;

    for (const conv of inactiveConversations || []) {
      // Check if we already sent a nudge recently (within last 3 days)
      const { data: recentNudge } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", conv.user_to_nudge)
        .eq("type", "nudge")
        .eq("related_user_id", conv.other_user_id)
        .gte("created_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNudge && recentNudge.length > 0) {
        console.log(`Skipping nudge for user ${conv.user_to_nudge} - already nudged recently`);
        continue;
      }

      // Send nudge notification
      const { error: notifyError } = await supabase.from("notifications").insert({
        user_id: conv.user_to_nudge,
        type: "nudge",
        title: "Don't leave them hanging! 💬",
        message: `${conv.other_user_name || "Someone"} is waiting to hear from you. Send a quick message!`,
        related_user_id: conv.other_user_id,
        read: false,
      });

      if (notifyError) {
        console.error(`Error sending nudge to ${conv.user_to_nudge}:`, notifyError);
      } else {
        nudgesSent++;
        console.log(`Sent nudge to user ${conv.user_to_nudge} about conversation with ${conv.other_user_name}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversationsChecked: inactiveConversations?.length || 0,
        nudgesSent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-conversation-nudges:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
