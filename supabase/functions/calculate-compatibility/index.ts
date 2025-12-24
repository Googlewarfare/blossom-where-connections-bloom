import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CALCULATE-COMPATIBILITY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Verify JWT and get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !authData.user) {
      logStep("ERROR: Authentication failed");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const callerUserId = authData.user.id;
    logStep("User authenticated", { userId: callerUserId });

    const { userId1, userId2 } = await req.json();

    if (!userId1 || !userId2) {
      logStep("ERROR: Missing user IDs");
      return new Response(JSON.stringify({ error: "Both user IDs are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Authorization: User must be one of the two users being compared
    if (callerUserId !== userId1 && callerUserId !== userId2) {
      logStep("ERROR: Unauthorized - user not part of comparison");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Additional check: Verify users have a match or at least a like between them
    const { data: match } = await supabaseClient
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .maybeSingle();

    if (!match) {
      // Check if there's at least a like from the caller
      const targetUserId = callerUserId === userId1 ? userId2 : userId1;
      const { data: like } = await supabaseClient
        .from('profile_likes')
        .select('id')
        .eq('liker_id', callerUserId)
        .eq('liked_user_id', targetUserId)
        .maybeSingle();

      if (!like) {
        logStep("ERROR: No match or like exists between users");
        return new Response(JSON.stringify({ error: "Users must have interaction to calculate compatibility" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
    }

    logStep("Calculating compatibility", { userId1, userId2 });

    // Fetch both user profiles and preferences
    const { data: profile1 } = await supabaseClient
      .from("profiles")
      .select("*, user_interests(interest_id, interests(name, category))")
      .eq("id", userId1)
      .single();

    const { data: profile2 } = await supabaseClient
      .from("profiles")
      .select("*, user_interests(interest_id, interests(name, category))")
      .eq("id", userId2)
      .single();

    const { data: pref1 } = await supabaseClient
      .from("preferences")
      .select("*")
      .eq("user_id", userId1)
      .single();

    const { data: pref2 } = await supabaseClient
      .from("preferences")
      .select("*")
      .eq("user_id", userId2)
      .single();

    if (!profile1 || !profile2 || !pref1 || !pref2) {
      logStep("ERROR: Could not fetch user data");
      return new Response(JSON.stringify({ error: "User data not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Calculate compatibility score
    const factors: any = {};
    let totalScore = 0;
    let factorCount = 0;

    // Shared interests (30%)
    const interests1 = new Set(profile1.user_interests?.map((i: any) => i.interest_id));
    const interests2 = new Set(profile2.user_interests?.map((i: any) => i.interest_id));
    const commonInterests = [...interests1].filter(i => interests2.has(i));
    const interestScore = Math.min(100, (commonInterests.length / Math.max(interests1.size, interests2.size, 1)) * 100);
    factors.interests = interestScore;
    totalScore += interestScore * 0.3;
    factorCount += 0.3;

    // Location proximity (20%)
    if (profile1.latitude && profile1.longitude && profile2.latitude && profile2.longitude) {
      const distance = calculateDistance(
        profile1.latitude, profile1.longitude,
        profile2.latitude, profile2.longitude
      );
      const locationScore = Math.max(0, 100 - (distance / 100)); // max 100 miles for full score
      factors.location = locationScore;
      totalScore += locationScore * 0.2;
      factorCount += 0.2;
    }

    // Lifestyle compatibility (15%)
    const lifestyleFactors = ['drinking', 'smoking', 'exercise', 'religion'];
    let lifestyleMatches = 0;
    for (const factor of lifestyleFactors) {
      if (profile1[factor] === profile2[factor]) lifestyleMatches++;
    }
    const lifestyleScore = (lifestyleMatches / lifestyleFactors.length) * 100;
    factors.lifestyle = lifestyleScore;
    totalScore += lifestyleScore * 0.15;
    factorCount += 0.15;

    // Relationship goals (20%)
    const goalScore = profile1.relationship_goal === profile2.relationship_goal ? 100 : 50;
    factors.goals = goalScore;
    totalScore += goalScore * 0.2;
    factorCount += 0.2;

    // Age preference match (10%)
    let ageScore = 0;
    if (profile1.age && profile2.age) {
      const age1InRange = profile2.age >= (pref1.min_age || 18) && profile2.age <= (pref1.max_age || 99);
      const age2InRange = profile1.age >= (pref2.min_age || 18) && profile1.age <= (pref2.max_age || 99);
      ageScore = (age1InRange && age2InRange) ? 100 : (age1InRange || age2InRange) ? 50 : 0;
    }
    factors.age = ageScore;
    totalScore += ageScore * 0.1;
    factorCount += 0.1;

    // Education level (5%)
    const educationScore = profile1.education === profile2.education ? 100 : 50;
    factors.education = educationScore;
    totalScore += educationScore * 0.05;
    factorCount += 0.05;

    const finalScore = Math.round(totalScore / factorCount);

    // Store the score
    await supabaseClient.from("compatibility_scores").upsert({
      user1_id: userId1,
      user2_id: userId2,
      score: finalScore,
      factors,
      calculated_at: new Date().toISOString()
    });

    logStep("Compatibility calculated", { score: finalScore });

    return new Response(
      JSON.stringify({ score: finalScore, factors }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: "Failed to calculate compatibility" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
