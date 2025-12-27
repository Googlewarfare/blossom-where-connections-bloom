import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConversationToNudge {
  conversation_id: string;
  other_user_name: string;
  user_to_nudge: string;
  days_inactive: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting ghosting reminder job...");

    // Get conversations that need 48h reminders (between 48-72 hours inactive)
    const { data: conversationsToNudge, error: fetchError } = await supabase
      .rpc("get_conversations_needing_nudge");

    if (fetchError) {
      console.error("Error fetching conversations:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${conversationsToNudge?.length || 0} conversations needing nudges`);

    if (!conversationsToNudge || conversationsToNudge.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No conversations need reminders",
          reminders_sent: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let remindersSent = 0;

    for (const conv of conversationsToNudge as ConversationToNudge[]) {
      // Check if we already sent a reminder for this conversation
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("reminder_sent_at")
        .eq("id", conv.conversation_id)
        .single();

      // Skip if reminder was already sent in the last 24 hours
      if (existingConv?.reminder_sent_at) {
        const reminderDate = new Date(existingConv.reminder_sent_at);
        const hoursSinceReminder = (Date.now() - reminderDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceReminder < 24) {
          console.log(`Skipping ${conv.conversation_id} - reminder already sent`);
          continue;
        }
      }

      // Create notification for the user who needs to respond
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: conv.user_to_nudge,
          type: "ghosting_reminder",
          title: "Someone is waiting for you",
          message: `${conv.other_user_name} reached out ${conv.days_inactive} days ago. At Blossom, we believe everyone deserves a response.`,
          related_user_id: null,
        });

      if (notifError) {
        console.error(`Error creating notification for ${conv.user_to_nudge}:`, notifError);
        continue;
      }

      // Update conversation with reminder timestamp
      await supabase
        .from("conversations")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", conv.conversation_id);

      console.log(`Sent reminder for conversation ${conv.conversation_id} to user ${conv.user_to_nudge}`);
      remindersSent++;
    }

    console.log(`Ghosting reminder job complete. Sent ${remindersSent} reminders.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${remindersSent} ghosting reminders`,
        reminders_sent: remindersSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in ghosting reminder function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
