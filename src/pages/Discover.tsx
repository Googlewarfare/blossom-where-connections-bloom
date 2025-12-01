import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, Briefcase, X, Map, MessageCircle, Sparkles, Star, ArrowLeft } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "@/lib/location-utils";
import MatchesMap from "@/components/MatchesMap";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { VerificationBadge } from "@/components/VerificationBadge";
import { AdvancedFilters } from "@/components/AdvancedFilters";
interface Profile {
  id: string;
  full_name: string;
  age: number | null;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  photo_url: string | null;
  interests: string[];
  latitude: number | null;
  longitude: number | null;
  distance?: number | null;
  verified: boolean;
}
const Discover = () => {
  const {
    user,
    subscriptionStatus,
    checkSubscription
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const [sendingSuperLike, setSendingSuperLike] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const UNLIMITED_SUPER_LIKES_PRODUCT_ID = "prod_TWguag6wQXdfSB";
  const hasUnlimitedSuperLikes = subscriptionStatus?.subscribed && subscriptionStatus.subscriptions?.some(sub => sub.product_id === UNLIMITED_SUPER_LIKES_PRODUCT_ID);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Handle super like and subscription success
  useEffect(() => {
    const handleSuccess = async () => {
      // Handle super like payment success
      const superLikeSuccess = searchParams.get('super_like_success');
      const recipientId = searchParams.get('recipient');
      if (superLikeSuccess === 'true' && recipientId && user) {
        // Record super like
        await supabase.from('super_likes').insert({
          sender_id: user.id,
          recipient_id: recipientId
        }).select().maybeSingle();

        // Also record as regular like
        await supabase.from('user_swipes').insert({
          user_id: user.id,
          target_user_id: recipientId,
          action_type: 'like'
        }).select().maybeSingle();
        await supabase.from('profile_likes').insert({
          liker_id: user.id,
          liked_user_id: recipientId
        }).select().maybeSingle();
        toast({
          title: "Super Like Sent! ⭐",
          description: "Your special interest has been noted!"
        });

        // Clear params and refresh
        window.history.replaceState({}, '', '/discover');
        window.location.reload();
      }

      // Handle subscription success
      const subscriptionSuccess = searchParams.get('subscription_success');
      if (subscriptionSuccess === 'true') {
        await checkSubscription();
        toast({
          title: "Subscription Active! 🎉",
          description: "You now have unlimited Super Likes!"
        });
        window.history.replaceState({}, '', '/discover');
      }
    };
    handleSuccess();
  }, [searchParams, user, toast, checkSubscription]);

  // Track profile view
  useEffect(() => {
    const trackView = async () => {
      if (currentProfile && user) {
        await supabase.from("profile_views").insert({
          viewer_id: user.id,
          viewed_user_id: currentProfile.id
        }).select().maybeSingle();
      }
    };
    trackView();
  }, [currentIndex, user]);
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const loadUserLocationAndFetchProfiles = async () => {
      try {
        // First, load user's own location
        const {
          data: userData
        } = await supabase.from("profiles").select("latitude, longitude").eq("id", user.id).single();
        const userLat = userData?.latitude;
        const userLon = userData?.longitude;
        if (userLat !== null && userLon !== null) {
          setUserLocation({
            latitude: userLat,
            longitude: userLon
          });
        }

        // Fetch user's preferences for distance filtering
        const {
          data: prefsData
        } = await supabase.from("preferences").select("show_profiles_within_miles").eq("user_id", user.id).single();
        const maxDistance = prefsData?.show_profiles_within_miles || 50;

        // Fetch profiles that haven't been swiped yet
        const {
          data: swipedIds
        } = await supabase.from("user_swipes").select("target_user_id").eq("user_id", user.id);
        const swipedUserIds = swipedIds?.map(s => s.target_user_id) || [];

        // Build query
        let query = supabase.from("profiles").select(`
            id,
            full_name,
            age,
            bio,
            location,
            occupation,
            latitude,
            longitude,
            verified
          `).neq("id", user.id).not("bio", "is", null);

        // Exclude already swiped profiles if any
        if (swipedUserIds.length > 0) {
          query = query.not("id", "in", `(${swipedUserIds.join(",")})`);
        }
        const {
          data: profilesData,
          error: profilesError
        } = await query.limit(50);
        if (profilesError) throw profilesError;

        // Fetch photos and interests, calculate distance, and filter
        const profilesWithDetails = await Promise.all((profilesData || []).map(async profile => {
          // Calculate distance if both users have location data
          let distance = null;
          if (userLat !== null && userLon !== null && profile.latitude !== null && profile.longitude !== null) {
            distance = calculateDistance(userLat, userLon, profile.latitude, profile.longitude);
          }

          // Skip if distance exceeds max distance preference
          if (distance !== null && distance > maxDistance) {
            return null;
          }
          const {
            data: photoData
          } = await supabase.from("profile_photos").select("photo_url").eq("user_id", profile.id).order("is_primary", {
            ascending: false
          }).order("display_order", {
            ascending: true
          }).limit(1).maybeSingle();

          // Generate signed URL for private photo bucket
          let signedPhotoUrl = null;
          if (photoData?.photo_url) {
            const {
              data: signedUrlData
            } = await supabase.storage.from("profile-photos").createSignedUrl(photoData.photo_url, 3600); // 1 hour expiration
            signedPhotoUrl = signedUrlData?.signedUrl || null;
          }

          // Fetch interests
          const {
            data: interestsData
          } = await supabase.from("user_interests").select(`
                interests (
                  name
                )
              `).eq("user_id", profile.id).limit(5);
          const interests = interestsData?.map((item: any) => item.interests.name) || [];
          return {
            ...profile,
            photo_url: signedPhotoUrl,
            interests,
            distance,
            verified: profile.verified || false
          };
        }));

        // Filter out null values (profiles that exceeded distance limit)
        const filteredProfiles = profilesWithDetails.filter(p => p !== null) as Profile[];
        setProfiles(filteredProfiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load profiles",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadUserLocationAndFetchProfiles();
  }, [user, navigate, toast]);
  const handleSwipe = async (action: "like" | "pass") => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;
    try {
      // Insert swipe action
      const {
        error: swipeError
      } = await supabase.from("user_swipes").insert({
        user_id: user!.id,
        target_user_id: currentProfile.id,
        action_type: action
      });
      if (swipeError) throw swipeError;

      // If it's a like, also insert into profile_likes
      if (action === "like") {
        await supabase.from("profile_likes").insert({
          liker_id: user!.id,
          liked_user_id: currentProfile.id
        }).select().maybeSingle();
      }

      // Check for match if it was a like
      if (action === "like") {
        const userId1 = user!.id < currentProfile.id ? user!.id : currentProfile.id;
        const userId2 = user!.id < currentProfile.id ? currentProfile.id : user!.id;
        const {
          data: matchData
        } = await supabase.from("matches").select("*").eq("user1_id", userId1).eq("user2_id", userId2).maybeSingle();
        if (matchData) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        } else {
          toast({
            title: action === "like" ? "Liked!" : "Passed",
            duration: 1500
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
        variant: "destructive"
      });
    }
  };
  const handleSuperLike = async () => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile || !user) return;

    // If user has unlimited subscription, send super like immediately
    if (hasUnlimitedSuperLikes) {
      try {
        // Record super like
        await supabase.from('super_likes').insert({
          sender_id: user.id,
          recipient_id: currentProfile.id
        });

        // Also record as regular like
        await supabase.from('user_swipes').insert({
          user_id: user.id,
          target_user_id: currentProfile.id,
          action_type: 'like'
        });
        await supabase.from('profile_likes').insert({
          liker_id: user.id,
          liked_user_id: currentProfile.id
        });

        // Check for match
        const userId1 = user.id < currentProfile.id ? user.id : currentProfile.id;
        const userId2 = user.id < currentProfile.id ? currentProfile.id : user.id;
        const {
          data: matchData
        } = await supabase.from("matches").select("*").eq("user1_id", userId1).eq("user2_id", userId2).maybeSingle();
        if (matchData) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        } else {
          toast({
            title: "Super Like Sent! ⭐",
            description: "Your special interest has been noted!"
          });
        }

        // Move to next profile
        setCurrentIndex(prev => prev + 1);
        x.set(0);
      } catch (error) {
        console.error('Error sending super like:', error);
        toast({
          title: "Error",
          description: "Failed to send Super Like",
          variant: "destructive"
        });
      }
      return;
    }

    // Otherwise, show payment option
    setSendingSuperLike(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-super-like-checkout', {
        body: {
          recipientId: currentProfile.id
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating super like checkout:', error);
      toast({
        title: "Error",
        description: "Failed to process Super Like payment",
        variant: "destructive"
      });
    } finally {
      setSendingSuperLike(false);
    }
  };
  const handleSubscribe = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-subscription-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription",
        variant: "destructive"
      });
    }
  };
  const handleManageSubscription = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive"
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
    return <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          </div>
        </div>
      </div>;
  }
  const currentProfile = profiles[currentIndex];
  return <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Completion Banner */}
        <div className="mb-6">
          <ProfileCompletionBanner />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Discover{" "}
              <span className="gradient-primary bg-clip-text text-primary-foreground">
                Your Match
              </span>
            </h1>
            <p className="text-muted-foreground">
              Swipe right to like, left to pass
            </p>
            {hasUnlimitedSuperLikes && <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                ⭐ Unlimited Super Likes Active
              </Badge>}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {hasUnlimitedSuperLikes ? <Button onClick={handleManageSubscription} variant="outline" className="rounded-full">
                <Star className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button> : <Button onClick={() => setShowSubscriptionDialog(true)} className="rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Get Unlimited Super Likes
              </Button>}
            <AdvancedFilters onFiltersApplied={() => window.location.reload()} />
            <Button onClick={() => setViewMode(viewMode === "cards" ? "map" : "cards")} variant="outline" className="rounded-full">
              {viewMode === "cards" ? <>
                  <Map className="w-4 h-4 mr-2" />
                  Map View
                </> : <>
                  <Heart className="w-4 h-4 mr-2" />
                  Card View
                </>}
            </Button>
            <Button onClick={() => navigate("/activity")} variant="outline" className="rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Activity
            </Button>
            <Button onClick={() => navigate("/matches")} variant="outline" className="rounded-full">
              <Heart className="w-4 h-4 mr-2" />
              Matches
            </Button>
            <Button onClick={() => navigate("/chat")} variant="outline" className="rounded-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <Button onClick={() => navigate("/profile")} variant="outline" className="rounded-full">
              My Profile
            </Button>
          </div>
        </div>

        {/* Map or Card View */}
        {viewMode === "map" ? <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-xl">
            <MatchesMap profiles={profiles.filter(p => p.latitude && p.longitude) as (Profile & {
          latitude: number;
          longitude: number;
        })[]} userLocation={userLocation || undefined} />
          </div> : (/* Swipe Card Stack */
      <div className="flex justify-center items-center min-h-[600px]">
          {!currentProfile || currentIndex >= profiles.length ? <div className="text-center py-20">
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
            </div> : <div className="relative w-full max-w-md">
              {/* Next card preview */}
              {profiles[currentIndex + 1] && <Card className="absolute inset-0 overflow-hidden border-2 opacity-50 scale-95">
                  <CardContent className="p-0">
                    <div className="relative h-[600px] overflow-hidden bg-muted">
                      {profiles[currentIndex + 1].photo_url && <img src={profiles[currentIndex + 1].photo_url} alt="Next profile" className="w-full h-full object-cover" />}
                    </div>
                  </CardContent>
                </Card>}

              {/* Current card */}
              <motion.div drag="x" dragConstraints={{
            left: 0,
            right: 0
          }} style={{
            x,
            rotate,
            opacity
          }} onDragEnd={handleDragEnd} className="relative cursor-grab active:cursor-grabbing">
                <Card className="overflow-hidden border-2 shadow-xl">
                  <CardContent className="p-0">
                    {/* Profile Photo */}
                    <div className="relative h-[600px] overflow-hidden bg-muted">
                      {currentProfile.photo_url ? <img src={currentProfile.photo_url} alt={currentProfile.full_name || "Profile"} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Heart className="w-20 h-20 text-primary/40" />
                        </div>}

                      {/* Swipe indicators */}
                      <motion.div className="absolute top-8 left-8 text-6xl font-bold text-red-500 opacity-0 rotate-12" style={{
                    opacity: useTransform(x, [-150, -50, 0], [1, 0.5, 0])
                  }}>
                        PASS
                      </motion.div>
                      <motion.div className="absolute top-8 right-8 text-6xl font-bold text-green-500 opacity-0 -rotate-12" style={{
                    opacity: useTransform(x, [0, 50, 150], [0, 0.5, 1])
                  }}>
                        LIKE
                      </motion.div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Profile Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-3xl font-bold">
                            {currentProfile.full_name}
                            {currentProfile.age && `, ${currentProfile.age}`}
                          </h3>
                          <VerificationBadge verified={currentProfile.verified} size="lg" />
                        </div>
                        <div className="space-y-2 mb-4">
                          {currentProfile.distance !== null && currentProfile.distance !== undefined && <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{currentProfile.distance} miles away</span>
                            </div>}
                          {currentProfile.location && <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 opacity-70" />
                              <span className="text-sm opacity-90">{currentProfile.location}</span>
                            </div>}
                          {currentProfile.occupation && <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{currentProfile.occupation}</span>
                            </div>}
                        </div>

                        {currentProfile.bio && <p className="text-sm mb-4 line-clamp-3">
                            {currentProfile.bio}
                          </p>}

                        {currentProfile.interests.length > 0 && <div className="flex flex-wrap gap-2">
                            {currentProfile.interests.map((interest, idx) => <Badge key={idx} variant="secondary" className="rounded-full bg-white/20 text-white border-white/30">
                                 {interest}
                              </Badge>)}
                          </div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button size="icon" variant="outline" className="h-16 w-16 rounded-full border-2 border-red-500/30 hover:bg-red-500 hover:text-white" onClick={() => handleSwipe("pass")}>
                  <X className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="outline" className="h-20 w-20 rounded-full border-2 border-green-500/30 hover:bg-green-500 hover:text-white" onClick={() => handleSwipe("like")}>
                  <Heart className="w-8 h-8" />
                </Button>
                <Button size="icon" variant="default" className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 border-2 border-yellow-300/50 shadow-lg shadow-amber-500/30" onClick={handleSuperLike} disabled={sendingSuperLike} title={hasUnlimitedSuperLikes ? "Send Super Like (Unlimited)" : "Send Super Like ($4.99)"}>
                  <Star className="w-6 h-6 fill-current" />
                </Button>
              </div>
            </div>}
        </div>)}
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
            {matchedProfile?.photo_url && <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                <img src={matchedProfile.photo_url} alt={matchedProfile.full_name || "Match"} className="w-full h-full object-cover" />
              </div>}
            <div className="flex gap-4 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setShowMatchModal(false)}>
                Keep Swiping
              </Button>
              <Button className="flex-1" onClick={() => navigate("/matches")}>
                View Matches
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Unlimited Super Likes ⭐
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Get unlimited Super Likes and stand out from the crowd!
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                    $9.99/month
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Send unlimited Super Likes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Stand out with priority visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Show you're really interested</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Cancel anytime</span>
                  </li>
                </ul>
                <Button onClick={handleSubscribe} className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600" size="lg">
                  <Star className="w-5 h-5 mr-2 fill-current" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="text-sm text-muted-foreground">Or send one at a time:</div>
              </div>
              <Button onClick={() => {
              setShowSubscriptionDialog(false);
              handleSuperLike();
            }} variant="outline" className="w-full">
                Send Single Super Like - $4.99
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Discover;