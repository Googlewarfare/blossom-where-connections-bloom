import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, Briefcase, X } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  age: number | null;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  photo_url: string | null;
  interests: string[];
}

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfiles = async () => {
      try {
        // Fetch profiles that haven't been swiped yet
        const { data: swipedIds } = await supabase
          .from("user_swipes")
          .select("target_user_id")
          .eq("user_id", user.id);

        const swipedUserIds = swipedIds?.map(s => s.target_user_id) || [];

        // Build query
        let query = supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            age,
            bio,
            location,
            occupation
          `)
          .neq("id", user.id)
          .not("bio", "is", null);

        // Exclude already swiped profiles if any
        if (swipedUserIds.length > 0) {
          query = query.not("id", "in", `(${swipedUserIds.join(",")})`);
        }

        const { data: profilesData, error: profilesError } = await query.limit(20);

        if (profilesError) throw profilesError;

        // Fetch photos for each profile
        const profilesWithPhotos = await Promise.all(
          (profilesData || []).map(async (profile) => {
            const { data: photoData } = await supabase
              .from("profile_photos")
              .select("photo_url")
              .eq("user_id", profile.id)
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

            // Fetch interests
            const { data: interestsData } = await supabase
              .from("user_interests")
              .select(`
                interests (
                  name
                )
              `)
              .eq("user_id", profile.id)
              .limit(5);

            const interests = interestsData?.map(
              (item: any) => item.interests.name
            ) || [];

            return {
              ...profile,
              photo_url: signedPhotoUrl,
              interests,
            };
          })
        );

        setProfiles(profilesWithPhotos);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user, navigate]);

  const handleSwipe = async (action: "like" | "pass") => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    try {
      // Insert swipe action
      const { error: swipeError } = await supabase
        .from("user_swipes")
        .insert({
          user_id: user!.id,
          target_user_id: currentProfile.id,
          action_type: action,
        });

      if (swipeError) throw swipeError;

      // Check for match if it was a like
      if (action === "like") {
        const userId1 = user!.id < currentProfile.id ? user!.id : currentProfile.id;
        const userId2 = user!.id < currentProfile.id ? currentProfile.id : user!.id;
        
        const { data: matchData } = await supabase
          .from("matches")
          .select("*")
          .eq("user1_id", userId1)
          .eq("user2_id", userId2)
          .maybeSingle();

        if (matchData) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        } else {
          toast({
            title: action === "like" ? "Liked!" : "Passed",
            duration: 1500,
          });
        }
      }

      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      x.set(0);
    } catch (error) {
      console.error("Error swiping:", error);
      toast({
        title: "Error",
        description: "Failed to record your action",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe("like");
    } else if (info.offset.x < -100) {
      handleSwipe("pass");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
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

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Discover{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Your Match
              </span>
            </h1>
            <p className="text-muted-foreground">
              Swipe right to like, left to pass
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/matches")}
              variant="outline"
              className="rounded-full"
            >
              <Heart className="w-4 h-4 mr-2" />
              Matches
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="rounded-full"
            >
              My Profile
            </Button>
          </div>
        </div>

        {/* Swipe Card Stack */}
        <div className="flex justify-center items-center min-h-[600px]">
          {!currentProfile || currentIndex >= profiles.length ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                No more profiles
              </h2>
              <p className="text-muted-foreground mb-4">
                Check back later for more matches
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate("/matches")} variant="outline">
                  View Matches
                </Button>
                <Button onClick={() => navigate("/profile")}>
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-md">
              {/* Next card preview */}
              {profiles[currentIndex + 1] && (
                <Card className="absolute inset-0 overflow-hidden border-2 opacity-50 scale-95">
                  <CardContent className="p-0">
                    <div className="relative h-[600px] overflow-hidden bg-muted">
                      {profiles[currentIndex + 1].photo_url && (
                        <img
                          src={profiles[currentIndex + 1].photo_url}
                          alt="Next profile"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current card */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                style={{ x, rotate, opacity }}
                onDragEnd={handleDragEnd}
                className="relative cursor-grab active:cursor-grabbing"
              >
                <Card className="overflow-hidden border-2 shadow-xl">
                  <CardContent className="p-0">
                    {/* Profile Photo */}
                    <div className="relative h-[600px] overflow-hidden bg-muted">
                      {currentProfile.photo_url ? (
                        <img
                          src={currentProfile.photo_url}
                          alt={currentProfile.full_name || "Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Heart className="w-20 h-20 text-primary/40" />
                        </div>
                      )}

                      {/* Swipe indicators */}
                      <motion.div
                        className="absolute top-8 left-8 text-6xl font-bold text-red-500 opacity-0 rotate-12"
                        style={{
                          opacity: useTransform(x, [-150, -50, 0], [1, 0.5, 0]),
                        }}
                      >
                        PASS
                      </motion.div>
                      <motion.div
                        className="absolute top-8 right-8 text-6xl font-bold text-green-500 opacity-0 -rotate-12"
                        style={{
                          opacity: useTransform(x, [0, 50, 150], [0, 0.5, 1]),
                        }}
                      >
                        LIKE
                      </motion.div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Profile Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-3xl font-bold mb-2">
                          {currentProfile.full_name}
                          {currentProfile.age && `, ${currentProfile.age}`}
                        </h3>
                        <div className="space-y-2 mb-4">
                          {currentProfile.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{currentProfile.location}</span>
                            </div>
                          )}
                          {currentProfile.occupation && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{currentProfile.occupation}</span>
                            </div>
                          )}
                        </div>

                        {currentProfile.bio && (
                          <p className="text-sm mb-4 line-clamp-3">
                            {currentProfile.bio}
                          </p>
                        )}

                        {currentProfile.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {currentProfile.interests.map((interest, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="rounded-full bg-white/20 text-white border-white/30"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-8 mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-2 hover:bg-red-500 hover:text-white hover:border-red-500"
                  onClick={() => handleSwipe("pass")}
                >
                  <X className="w-8 h-8" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-2 hover:bg-green-500 hover:text-white hover:border-green-500"
                  onClick={() => handleSwipe("like")}
                >
                  <Heart className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Modal */}
      <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              It's a Match! 🎉
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              You and {matchedProfile?.full_name} liked each other!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {matchedProfile?.photo_url && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src={matchedProfile.photo_url}
                  alt={matchedProfile.full_name || "Match"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowMatchModal(false)}
              >
                Keep Swiping
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/matches")}
              >
                View Matches
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discover;
