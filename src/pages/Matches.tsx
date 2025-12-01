import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, MapPin, Briefcase, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CompatibilityScore } from "@/components/CompatibilityScore";

interface MatchProfile {
  id: string;
  full_name: string;
  age: number | null;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  photo_url: string | null;
  match_id: string;
  matched_at: string;
  verified: boolean;
}

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchMatches = async () => {
      try {
        // Fetch all matches for the current user
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (matchesError) throw matchesError;

        // Fetch profile data for each match
        const matchProfiles = await Promise.all(
          (matchesData || []).map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, full_name, age, bio, location, occupation, verified")
              .eq("id", otherUserId)
              .single();

            // Fetch primary photo
            const { data: photoData } = await supabase
              .from("profile_photos")
              .select("photo_url")
              .eq("user_id", otherUserId)
              .order("is_primary", { ascending: false })
              .order("display_order", { ascending: true })
              .limit(1)
              .maybeSingle();

            // Generate signed URL for private photo bucket
            let signedPhotoUrl = null;
            if (photoData?.photo_url) {
              const { data: signedUrlData } = await supabase.storage
                .from("profile-photos")
                .createSignedUrl(photoData.photo_url, 3600); // 1 hour expiration
              signedPhotoUrl = signedUrlData?.signedUrl || null;
            }

            return {
              ...profileData,
              photo_url: signedPhotoUrl,
              match_id: match.id,
              matched_at: match.created_at,
            } as MatchProfile;
          })
        );

        setMatches(matchProfiles.filter(Boolean));
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Error",
          description: "Failed to load matches",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user, navigate, toast]);

  const handleStartConversation = async (matchProfile: MatchProfile) => {
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("match_id", matchProfile.match_id)
        .maybeSingle();

      if (existingConv) {
        navigate(`/chat?id=${existingConv.id}`);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({ match_id: matchProfile.match_id })
          .select()
          .single();

        if (error) throw error;
        navigate(`/chat?id=${newConv.id}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Completion Banner */}
        <div className="mb-6">
          <ProfileCompletionBanner />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Your{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Matches
              </span>
            </h1>
            <p className="text-muted-foreground">
              {matches.length} {matches.length === 1 ? "match" : "matches"} found
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/activity")}
              variant="outline"
              className="rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Activity
            </Button>
            <Button
              onClick={() => navigate("/discover")}
              variant="outline"
              className="rounded-full"
            >
              Keep Swiping
            </Button>
            <Button
              onClick={() => navigate("/chat")}
              variant="outline"
              className="rounded-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
          </div>
        </div>

        {/* Matches Grid */}
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No matches yet</h2>
            <p className="text-muted-foreground mb-6">
              Start swiping to find your perfect match
            </p>
            <Button onClick={() => navigate("/discover")}>
              Go to Discover
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.match_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-soft transition-smooth border-2">
                  <CardContent className="p-0">
                    {/* Profile Photo */}
                    <div className="relative h-80 overflow-hidden bg-muted">
                      {match.photo_url ? (
                        <img
                          src={match.photo_url}
                          alt={match.full_name || "Match"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Heart className="w-20 h-20 text-primary/40" />
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Profile Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold">
                            {match.full_name}
                            {match.age && `, ${match.age}`}
                          </h3>
                          <VerificationBadge verified={match.verified} size="md" />
                        </div>
                        
                        <div className="mb-2">
                          <CompatibilityScore targetUserId={match.id} />
                        </div>

                        <div className="space-y-1">
                          {match.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>{match.location}</span>
                            </div>
                          )}
                          {match.occupation && (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4" />
                              <span>{match.occupation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio and Actions */}
                    <div className="p-6 space-y-4">
                      {match.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {match.bio}
                        </p>
                      )}

                      <Button
                        onClick={() => handleStartConversation(match)}
                        className="w-full"
                        size="lg"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Conversation
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Matched on{" "}
                        {new Date(match.matched_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
