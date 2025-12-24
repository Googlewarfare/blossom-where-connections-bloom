import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Heart, LogOut, X, Star, MapPin, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { getCurrentLocation } from "@/lib/location-utils";
import Navbar from "@/components/Navbar";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";

interface ProfileData {
  full_name: string;
  bio: string;
  age: number | null;
  gender: string;
  location: string;
  occupation: string;
  latitude: number | null;
  longitude: number | null;
  education: string;
  lifestyle: string;
  relationship_goal: string;
  drinking: string;
  smoking: string;
  exercise: string;
  height_cm: number | null;
  religion: string;
  verified: boolean;
  verification_status: string;
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
  show_profiles_within_miles: number;
}

interface ProfilePhoto {
  id: string;
  photo_url: string;
  signed_url: string;
  is_primary: boolean;
  display_order: number;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    bio: "",
    age: null,
    gender: "",
    location: "",
    occupation: "",
    latitude: null,
    longitude: null,
    education: "",
    lifestyle: "",
    relationship_goal: "",
    drinking: "",
    smoking: "",
    exercise: "",
    height_cm: null,
    religion: "",
    verified: false,
    verification_status: "unverified",
  });
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    min_age: 18,
    max_age: 99,
    max_distance: 50,
    interested_in: [],
    show_profiles_within_miles: 50,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPhotos();
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
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          education: data.education || "",
          lifestyle: data.lifestyle || "",
          relationship_goal: data.relationship_goal || "",
          drinking: data.drinking || "",
          smoking: data.smoking || "",
          exercise: data.exercise || "",
          height_cm: data.height_cm || null,
          religion: data.religion || "",
          verified: data.verified || false,
          verification_status: data.verification_status || "unverified",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const { data: photosData, error } = await supabase
        .from("profile_photos")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_primary", { ascending: false })
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Generate signed URLs for all photos
      const photosWithSignedUrls = await Promise.all(
        (photosData || []).map(async (photo) => {
          const { data: signedUrlData } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(photo.photo_url, 3600); // 1 hour expiration

          return {
            id: photo.id,
            photo_url: photo.photo_url,
            signed_url: signedUrlData?.signedUrl || "",
            is_primary: photo.is_primary || false,
            display_order: photo.display_order || 0,
          };
        })
      );

      setPhotos(photosWithSignedUrls);
    } catch (error) {
      console.error("Error loading photos:", error);
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
          show_profiles_within_miles: data.show_profiles_within_miles || 50,
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
          education: profile.education || null,
          lifestyle: profile.lifestyle || null,
          relationship_goal: profile.relationship_goal || null,
          drinking: profile.drinking || null,
          smoking: profile.smoking || null,
          exercise: profile.exercise || null,
          height_cm: profile.height_cm || null,
          religion: profile.religion || null,
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert photo record into database
      const { error: dbError } = await supabase
        .from("profile_photos")
        .insert({
          user_id: user!.id,
          photo_url: fileName,
          is_primary: photos.length === 0, // First photo is primary
          display_order: photos.length,
        });

      if (dbError) throw dbError;

      toast({
        title: "Photo Uploaded",
        description: "Your photo has been uploaded successfully.",
      });

      // Reload photos
      await loadPhotos();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("profile-photos")
        .remove([photoUrl]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("profile_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      toast({
        title: "Photo Deleted",
        description: "Your photo has been removed.",
      });

      // Reload photos
      await loadPhotos();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetPrimaryPhoto = async (photoId: string) => {
    try {
      // Set all photos to non-primary
      await supabase
        .from("profile_photos")
        .update({ is_primary: false })
        .eq("user_id", user!.id);

      // Set selected photo as primary
      const { error } = await supabase
        .from("profile_photos")
        .update({ is_primary: true })
        .eq("id", photoId);

      if (error) throw error;

      toast({
        title: "Primary Photo Updated",
        description: "Your primary photo has been set.",
      });

      // Reload photos
      await loadPhotos();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12 px-4">
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/safety")} className="rounded-full">
              <Shield className="w-4 h-4 mr-2" />
              Safety
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="rounded-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Profile Completion Banner */}
        <div className="mb-6">
          <ProfileCompletionBanner />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8 space-y-6">
              {/* Photo Upload Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Photos</h3>
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group">
                      <img
                        src={photo.signed_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!photo.is_primary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimaryPhoto(photo.id)}
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {photo.is_primary && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Add Photo</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload up to 6 photos. First photo will be your primary photo. Max 5MB per photo.
                </p>
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
                    placeholder="City, State"
                    maxLength={100}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setLoadingLocation(true);
                      try {
                        const coords = await getCurrentLocation();
                        setProfile({
                          ...profile,
                          latitude: coords.latitude,
                          longitude: coords.longitude,
                        });
                        toast({
                          title: "Location Captured",
                          description: "Your location coordinates have been set.",
                        });
                      } catch (error) {
                        toast({
                          title: "Location Error",
                          description: "Unable to get your location.",
                          variant: "destructive",
                        });
                      } finally {
                        setLoadingLocation(false);
                      }
                    }}
                    disabled={loadingLocation}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {loadingLocation ? "Getting location..." : profile.latitude ? "Update My Location" : "Use My Location"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {profile.latitude && profile.longitude
                      ? `Coordinates set (${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)})`
                      : "Click to use your device's location for distance calculation"}
                  </p>
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

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-lg">Additional Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      placeholder="e.g., Bachelors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="heightFeet" className="text-xs text-muted-foreground">Feet</Label>
                        <Input
                          id="heightFeet"
                          type="number"
                          value={profile.height_cm ? Math.floor((profile.height_cm / 2.54) / 12) : ""}
                          onChange={(e) => {
                            const feet = parseInt(e.target.value) || 0;
                            const inches = profile.height_cm ? Math.round((profile.height_cm / 2.54) % 12) : 0;
                            setProfile({ ...profile, height_cm: Math.round((feet * 12 + inches) * 2.54) });
                          }}
                          placeholder="5"
                          min="3"
                          max="8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="heightInches" className="text-xs text-muted-foreground">Inches</Label>
                        <Input
                          id="heightInches"
                          type="number"
                          value={profile.height_cm ? Math.round((profile.height_cm / 2.54) % 12) : ""}
                          onChange={(e) => {
                            const feet = profile.height_cm ? Math.floor((profile.height_cm / 2.54) / 12) : 0;
                            const inches = parseInt(e.target.value) || 0;
                            setProfile({ ...profile, height_cm: Math.round((feet * 12 + inches) * 2.54) });
                          }}
                          placeholder="10"
                          min="0"
                          max="11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lifestyle">Lifestyle</Label>
                    <Input
                      id="lifestyle"
                      value={profile.lifestyle}
                      onChange={(e) => setProfile({ ...profile, lifestyle: e.target.value })}
                      placeholder="e.g., Active"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship_goal">Looking For</Label>
                    <Input
                      id="relationship_goal"
                      value={profile.relationship_goal}
                      onChange={(e) => setProfile({ ...profile, relationship_goal: e.target.value })}
                      placeholder="e.g., Relationship"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="drinking">Drinking</Label>
                    <Input
                      id="drinking"
                      value={profile.drinking}
                      onChange={(e) => setProfile({ ...profile, drinking: e.target.value })}
                      placeholder="e.g., Socially"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking</Label>
                    <Input
                      id="smoking"
                      value={profile.smoking}
                      onChange={(e) => setProfile({ ...profile, smoking: e.target.value })}
                      placeholder="e.g., Never"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise</Label>
                    <Input
                      id="exercise"
                      value={profile.exercise}
                      onChange={(e) => setProfile({ ...profile, exercise: e.target.value })}
                      placeholder="e.g., Daily"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={profile.religion}
                      onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                      placeholder="e.g., Christian"
                    />
                  </div>
                </div>
              </div>

              {profile.verified ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                      ✓ Verified Profile
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Your profile is verified
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm mb-1">Get Verified</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.verification_status === 'pending' 
                          ? 'Your verification is being reviewed'
                          : 'Stand out with a verified badge'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/verification')}
                      disabled={profile.verification_status === 'pending'}
                    >
                      {profile.verification_status === 'pending' ? 'Pending' : 'Get Verified'}
                    </Button>
                  </div>
                </div>
              )}

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
                  <Label>Maximum Distance: {preferences.show_profiles_within_miles} miles</Label>
                  <Slider
                    value={[preferences.show_profiles_within_miles]}
                    onValueChange={([value]) => setPreferences({ ...preferences, show_profiles_within_miles: value })}
                    min={1}
                    max={500}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only show profiles within this distance from your location
                  </p>
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

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <TwoFactorSetup />
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Security Overview</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Your account is protected with password authentication</p>
                  <p>• Enable 2FA above for additional security</p>
                  <p>• Session timeout: 30 minutes of inactivity</p>
                  <p>• Failed login attempts are tracked and accounts are temporarily locked after 5 attempts</p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
};

export default Profile;
