import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Eye, Users, Sparkles, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { VerificationBadge } from "@/components/VerificationBadge";

interface ActivityUser {
  id: string;
  full_name: string;
  age: number | null;
  photo_url: string | null;
  verified: boolean;
  timestamp: string;
  is_super_like?: boolean;
}

const Activity = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<ActivityUser[]>([]);
  const [profileLikes, setProfileLikes] = useState<ActivityUser[]>([]);
  const [superLikes, setSuperLikes] = useState<ActivityUser[]>([]);
  const [profileViews, setProfileViews] = useState<ActivityUser[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadActivity();
    }
  }, [user, authLoading, navigate]);

  const loadActivity = async () => {
    if (!user) return;

    try {
      // Load recent matches (last 30 days)
      const { data: matchesData } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("created_at", { ascending: false })
        .limit(10);

      const matchUsers = await Promise.all(
        (matchesData || []).map(async (match) => {
          const otherUserId =
            match.user1_id === user.id ? match.user2_id : match.user1_id;
          return await fetchUserDetails(otherUserId, match.created_at);
        }),
      );

      setRecentMatches(matchUsers.filter(Boolean) as ActivityUser[]);

      // Load super likes (last 7 days) - Priority display
      const { data: superLikesData } = await supabase
        .from("super_likes")
        .select("sender_id, created_at")
        .eq("recipient_id", user.id)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("created_at", { ascending: false })
        .limit(20);

      const superLikeUsers = await Promise.all(
        (superLikesData || []).map(async (superLike) => {
          const userDetails = await fetchUserDetails(
            superLike.sender_id,
            superLike.created_at,
          );
          return userDetails ? { ...userDetails, is_super_like: true } : null;
        }),
      );

      setSuperLikes(superLikeUsers.filter(Boolean) as ActivityUser[]);

      // Load regular likes (last 7 days) - excluding super likes
      const superLikeSenderIds =
        superLikesData?.map((sl) => sl.sender_id) || [];

      const { data: likesData } = await supabase
        .from("profile_likes")
        .select("liker_id, created_at")
        .eq("liked_user_id", user.id)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("created_at", { ascending: false })
        .limit(20);

      const likeUsers = await Promise.all(
        (likesData || [])
          .filter((like) => !superLikeSenderIds.includes(like.liker_id))
          .map(async (like) => {
            return await fetchUserDetails(like.liker_id, like.created_at);
          }),
      );

      setProfileLikes(likeUsers.filter(Boolean) as ActivityUser[]);

      // Load profile views (last 7 days)
      const { data: viewsData } = await supabase
        .from("profile_views")
        .select("viewer_id, viewed_at")
        .eq("viewed_user_id", user.id)
        .gte(
          "viewed_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("viewed_at", { ascending: false })
        .limit(20);

      const viewUsers = await Promise.all(
        (viewsData || []).map(async (view) => {
          return await fetchUserDetails(view.viewer_id, view.viewed_at);
        }),
      );

      setProfileViews(viewUsers.filter(Boolean) as ActivityUser[]);
    } catch (error) {
      console.error("Error loading activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (
    userId: string,
    timestamp: string,
  ): Promise<ActivityUser | null> => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, age, verified")
        .eq("id", userId)
        .single();

      if (!profile) return null;

      const { data: photo } = await supabase
        .from("profile_photos")
        .select("photo_url")
        .eq("user_id", userId)
        .eq("is_primary", true)
        .limit(1)
        .maybeSingle();

      let signedPhotoUrl = null;
      if (photo?.photo_url) {
        const { data: signedUrlData } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(photo.photo_url, 3600);
        signedPhotoUrl = signedUrlData?.signedUrl || null;
      }

      return {
        id: profile.id,
        full_name: profile.full_name || "Unknown",
        age: profile.age,
        photo_url: signedPhotoUrl,
        verified: profile.verified || false,
        timestamp,
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const ActivityCard = ({
    user: activityUser,
    icon: Icon,
    iconColor,
  }: {
    user: ActivityUser;
    icon: any;
    iconColor: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
          activityUser.is_super_like
            ? "border-2 border-amber-400 shadow-lg shadow-amber-500/20"
            : ""
        }`}
        onClick={() => navigate(`/discover`)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={activityUser.photo_url || undefined} />
              <AvatarFallback>{activityUser.full_name[0]}</AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-1 -right-1 ${iconColor} rounded-full p-1.5`}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>
            {activityUser.is_super_like && (
              <motion.div
                className="absolute -top-1 -left-1 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full p-1"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Star className="h-3 w-3 text-white fill-white" />
              </motion.div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {activityUser.full_name}
                {activityUser.age && `, ${activityUser.age}`}
              </h3>
              <VerificationBadge verified={activityUser.verified} size="sm" />
              {activityUser.is_super_like && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  Super Like
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activityUser.timestamp), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-4">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="gradient-hero">
        <div className="container mx-auto max-w-4xl p-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/discover")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Activity
              </h1>
              <p className="text-muted-foreground">
                See who's interested in you
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="likes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches" className="gap-2">
                <Users className="h-4 w-4" />
                Matches
                {recentMatches.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {recentMatches.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="likes" className="gap-2">
                <Heart className="h-4 w-4" />
                Likes
                {profileLikes.length + superLikes.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {profileLikes.length + superLikes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="views" className="gap-2">
                <Eye className="h-4 w-4" />
                Views
                {profileViews.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {profileViews.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Recent Matches */}
            <TabsContent value="matches">
              <div className="space-y-3">
                {recentMatches.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No recent matches
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Keep swiping to find your perfect match
                    </p>
                    <Button onClick={() => navigate("/discover")}>
                      Start Swiping
                    </Button>
                  </Card>
                ) : (
                  recentMatches.map((match) => (
                    <ActivityCard
                      key={match.id}
                      user={match}
                      icon={Users}
                      iconColor="bg-gradient-to-br from-pink-500 to-purple-500"
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Who Liked You - Super Likes at Top */}
            <TabsContent value="likes">
              <div className="space-y-3">
                {superLikes.length === 0 && profileLikes.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No likes yet</h3>
                    <p className="text-muted-foreground mb-4">
                      People who like you will appear here
                    </p>
                    <Button onClick={() => navigate("/profile")}>
                      Improve Your Profile
                    </Button>
                  </Card>
                ) : (
                  <>
                    {/* Super Likes Section - Priority Display */}
                    {superLikes.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Super Likes
                          </h3>
                        </div>
                        {superLikes.map((like) => (
                          <ActivityCard
                            key={like.id}
                            user={like}
                            icon={Star}
                            iconColor="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500"
                          />
                        ))}
                      </div>
                    )}

                    {/* Regular Likes Section */}
                    {profileLikes.length > 0 && (
                      <div className="space-y-3 mt-6">
                        {superLikes.length > 0 && (
                          <div className="flex items-center gap-2 px-2">
                            <Heart className="h-5 w-5 text-pink-500" />
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                              Regular Likes
                            </h3>
                          </div>
                        )}
                        {profileLikes.map((like) => (
                          <ActivityCard
                            key={like.id}
                            user={like}
                            icon={Heart}
                            iconColor="bg-gradient-to-br from-red-500 to-pink-500"
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* Profile Views */}
            <TabsContent value="views">
              <div className="space-y-3">
                {profileViews.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No profile views
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      People who view your profile will appear here
                    </p>
                    <Button onClick={() => navigate("/profile")}>
                      Update Your Profile
                    </Button>
                  </Card>
                ) : (
                  profileViews.map((view) => (
                    <ActivityCard
                      key={view.id}
                      user={view}
                      icon={Eye}
                      iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Activity;
