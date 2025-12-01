import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfiles = async () => {
      try {
        // Fetch profiles with their primary photo
        const { data: profilesData, error: profilesError } = await supabase
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
          .not("bio", "is", null)
          .limit(20);

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
              .single();

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
              photo_url: photoData?.photo_url || null,
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
              Explore profiles and find your perfect connection
            </p>
          </div>
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="rounded-full"
          >
            My Profile
          </Button>
        </div>

        {/* Profile Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No profiles yet</h2>
            <p className="text-muted-foreground">
              Check back soon for potential matches
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-soft transition-smooth cursor-pointer group border-2 hover:border-primary/50">
                  <CardContent className="p-0">
                    {/* Profile Photo */}
                    <div className="relative h-80 overflow-hidden bg-muted">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt={profile.full_name || "Profile"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
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
                        <h3 className="text-2xl font-bold mb-1">
                          {profile.full_name}
                          {profile.age && `, ${profile.age}`}
                        </h3>
                        <div className="space-y-1">
                          {profile.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile.occupation && (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4" />
                              <span>{profile.occupation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio and Interests */}
                    <div className="p-6 space-y-4">
                      {profile.bio && (
                        <p className="text-sm text-foreground line-clamp-3">
                          {profile.bio}
                        </p>
                      )}
                      
                      {profile.interests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="rounded-full"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
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

export default Discover;
