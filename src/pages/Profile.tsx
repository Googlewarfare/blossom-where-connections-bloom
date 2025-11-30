import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Heart, LogOut, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface ProfileData {
  full_name: string;
  bio: string;
  age: number | null;
  gender: string;
  location: string;
  occupation: string;
}

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface Preferences {
  min_age: number;
  max_age: number;
  max_distance: number;
  interested_in: string[];
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    bio: "",
    age: null,
    gender: "",
    location: "",
    occupation: "",
  });
  
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    min_age: 18,
    max_age: 99,
    max_distance: 50,
    interested_in: [],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadInterests();
      loadUserInterests();
      loadPreferences();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          age: data.age,
          gender: data.gender || "",
          location: data.location || "",
          occupation: data.occupation || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInterests = async () => {
    try {
      const { data, error } = await supabase
        .from("interests")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setAllInterests(data || []);
    } catch (error) {
      console.error("Error loading interests:", error);
    }
  };

  const loadUserInterests = async () => {
    try {
      const { data, error } = await supabase
        .from("user_interests")
        .select("interest_id")
        .eq("user_id", user!.id);

      if (error) throw error;
      setSelectedInterests(data?.map(item => item.interest_id) || []);
    } catch (error) {
      console.error("Error loading user interests:", error);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setPreferences({
          min_age: data.min_age || 18,
          max_age: data.max_age || 99,
          max_distance: data.max_distance || 50,
          interested_in: data.interested_in || [],
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          age: profile.age,
          gender: profile.gender,
          location: profile.location,
          occupation: profile.occupation,
        })
        .eq("id", user!.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = async (interestId: string) => {
    try {
      if (selectedInterests.includes(interestId)) {
        const { error } = await supabase
          .from("user_interests")
          .delete()
          .eq("user_id", user!.id)
          .eq("interest_id", interestId);

        if (error) throw error;
        setSelectedInterests(selectedInterests.filter(id => id !== interestId));
      } else {
        const { error } = await supabase
          .from("user_interests")
          .insert({ user_id: user!.id, interest_id: interestId });

        if (error) throw error;
        setSelectedInterests([...selectedInterests, interestId]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("preferences")
        .update({
          min_age: preferences.min_age,
          max_age: preferences.max_age,
          max_distance: preferences.max_distance,
          interested_in: preferences.interested_in,
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-current" />
            <div>
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className="text-muted-foreground">Manage your Blossom profile</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="rounded-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8 space-y-6">
              {/* Photo Upload Placeholder */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profile.bio.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age || ""}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                      min={18}
                      max={99}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    maxLength={100}
                  />
                </div>
              </div>

              <Button
                onClick={saveProfile}
                className="w-full rounded-full"
                size="lg"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </Card>
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests">
            <Card className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Select Your Interests</h3>
                <p className="text-muted-foreground">Choose activities and topics you enjoy</p>
              </div>

              <div className="space-y-6">
                {Object.entries(
                  allInterests.reduce((acc, interest) => {
                    if (!acc[interest.category]) acc[interest.category] = [];
                    acc[interest.category].push(interest);
                    return acc;
                  }, {} as Record<string, Interest[]>)
                ).map(([category, interests]) => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3 text-primary">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge
                          key={interest.id}
                          variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                          className="cursor-pointer px-4 py-2 transition-smooth hover:scale-105"
                          onClick={() => toggleInterest(interest.id)}
                        >
                          {interest.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Match Preferences</h3>
                <p className="text-muted-foreground">Set your dating preferences</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Age Range: {preferences.min_age} - {preferences.max_age}</Label>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <Slider
                        value={[preferences.min_age]}
                        onValueChange={([value]) => setPreferences({ ...preferences, min_age: value })}
                        min={18}
                        max={preferences.max_age - 1}
                        step={1}
                      />
                    </div>
                    <div className="flex-1">
                      <Slider
                        value={[preferences.max_age]}
                        onValueChange={([value]) => setPreferences({ ...preferences, max_age: value })}
                        min={preferences.min_age + 1}
                        max={99}
                        step={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Maximum Distance: {preferences.max_distance} km</Label>
                  <Slider
                    value={[preferences.max_distance]}
                    onValueChange={([value]) => setPreferences({ ...preferences, max_distance: value })}
                    min={1}
                    max={500}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interested In</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Men", "Women", "Everyone"].map((option) => (
                      <Badge
                        key={option}
                        variant={preferences.interested_in.includes(option) ? "default" : "outline"}
                        className="cursor-pointer px-4 py-2 transition-smooth hover:scale-105"
                        onClick={() => {
                          if (preferences.interested_in.includes(option)) {
                            setPreferences({
                              ...preferences,
                              interested_in: preferences.interested_in.filter(i => i !== option),
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              interested_in: [...preferences.interested_in, option],
                            });
                          }
                        }}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={savePreferences}
                className="w-full rounded-full"
                size="lg"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
