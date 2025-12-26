import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Heart } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("50");
  const [maxDistance, setMaxDistance] = useState("50");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 6) {
      toast({
        title: "Too many photos",
        description: "You can upload up to 6 photos",
        variant: "destructive",
      });
      return;
    }

    setPhotoFiles([...photoFiles, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          age: parseInt(age),
          gender,
          occupation,
          bio,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Upload photos
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

        const { error: photoError } = await supabase
          .from("profile_photos")
          .insert({
            user_id: user.id,
            photo_url: publicUrl,
            is_primary: i === 0,
            display_order: i,
          });

        if (photoError) throw photoError;
      }

      // Save preferences (upsert since row may exist from signup trigger)
      const { error: preferencesError } = await supabase
        .from("preferences")
        .upsert(
          {
            user_id: user.id,
            interested_in: interestedIn,
            min_age: parseInt(minAge),
            max_age: parseInt(maxAge),
            max_distance: parseInt(maxDistance),
          },
          { onConflict: "user_id" },
        );

      if (preferencesError) throw preferencesError;

      toast({
        title: "Profile completed!",
        description: "Welcome to Blossom",
      });

      navigate("/discover");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!age || !gender)) {
      toast({
        title: "Required fields",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && photoFiles.length === 0) {
      toast({
        title: "Add a photo",
        description: "Please add at least one photo",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && !bio) {
      toast({
        title: "Add a bio",
        description: "Tell others about yourself",
        variant: "destructive",
      });
      return;
    }
    if (step === 4 && interestedIn.length === 0) {
      toast({
        title: "Set preferences",
        description: "Who would you like to meet?",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-sm text-muted-foreground">
              Step {step} of 4
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Let's set up your profile to find your perfect match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label>Profile Photos (up to 6) *</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {photoPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removePhoto(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {photoFiles.length < 6 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center transition-colors">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={6}
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label>Interested in *</Label>
                  <div className="space-y-2 mt-2">
                    {["male", "female", "non-binary", "everyone"].map(
                      (option) => (
                        <div
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={option}
                            checked={interestedIn.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInterestedIn([...interestedIn, option]);
                              } else {
                                setInterestedIn(
                                  interestedIn.filter((i) => i !== option),
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <Label
                            htmlFor={option}
                            className="capitalize cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAge">Age Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="minAge"
                        type="number"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        min="18"
                        max="100"
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        min="18"
                        max="100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxDistance">Max Distance (miles)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(e.target.value)}
                      min="1"
                      max="500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Completing..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
