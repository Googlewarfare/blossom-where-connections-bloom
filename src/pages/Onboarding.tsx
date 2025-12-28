import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/OptimizedImage";
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
import { Upload, Heart, AlertCircle, ArrowRight } from "lucide-react";
import { onboardingSchema, sanitizeString } from "@/lib/validation";
import { OnboardingWelcome, IntentQuestions, INTENT_PROMPTS, ManifestoAgreement } from "@/features/onboarding";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TOTAL_STEPS = 7; // Welcome, Manifesto, Basic Info, Photos, Bio, Preferences, Intent
const MIN_INTENT_CHARS = 50; // Minimum characters for intent questions

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0); // Start at welcome step
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  
  // Intent prompts state
  const [intentAnswers, setIntentAnswers] = useState<Record<string, string>>({});
  
  // Manifesto agreement state
  const [manifestoAgreed, setManifestoAgreed] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File must be less than 10MB";
    }
    const safeNamePattern = /^[a-zA-Z0-9_\-\.\s]+$/;
    if (!safeNamePattern.test(file.name)) {
      return "File name contains invalid characters";
    }
    return null;
  };

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

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: error,
          variant: "destructive",
        });
        return;
      }
    }

    setPhotoFiles([...photoFiles, ...files]);

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

  const handleIntentChange = (key: string, value: string) => {
    setIntentAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 1: Manifesto Agreement
    if (step === 1) {
      if (!manifestoAgreed) {
        newErrors.manifesto = "You must agree to all commitments to continue";
      }
    }

    // Step 2: Basic Info
    if (step === 2) {
      const ageNum = parseInt(age);
      if (!age || isNaN(ageNum)) {
        newErrors.age = "Age is required";
      } else if (ageNum < 18) {
        newErrors.age = "You must be at least 18 years old";
      } else if (ageNum > 120) {
        newErrors.age = "Please enter a valid age";
      }

      if (!gender) {
        newErrors.gender = "Gender is required";
      }

      if (occupation && occupation.length > 100) {
        newErrors.occupation = "Occupation must be less than 100 characters";
      }
    }

    // Step 3: Photos
    if (step === 3) {
      if (photoFiles.length === 0) {
        newErrors.photos = "Please add at least one photo";
      }
    }

    // Step 4: Bio
    if (step === 4) {
      if (!bio || bio.trim().length < 10) {
        newErrors.bio = "Bio must be at least 10 characters";
      } else if (bio.length > 1000) {
        newErrors.bio = "Bio must be less than 1000 characters";
      }
    }

    // Step 5: Preferences
    if (step === 5) {
      if (interestedIn.length === 0) {
        newErrors.interestedIn = "Please select at least one preference";
      }

      const minAgeNum = parseInt(minAge);
      const maxAgeNum = parseInt(maxAge);
      if (minAgeNum < 18 || minAgeNum > 100) {
        newErrors.minAge = "Minimum age must be between 18 and 100";
      }
      if (maxAgeNum < 18 || maxAgeNum > 100) {
        newErrors.maxAge = "Maximum age must be between 18 and 100";
      }
      if (minAgeNum > maxAgeNum) {
        newErrors.minAge = "Minimum age cannot be greater than maximum age";
      }

      const distanceNum = parseInt(maxDistance);
      if (distanceNum < 1 || distanceNum > 500) {
        newErrors.maxDistance = "Distance must be between 1 and 500 miles";
      }
    }

    // Step 6: Intent Questions - NOW REQUIRED
    if (step === 6) {
      for (const prompt of INTENT_PROMPTS) {
        const answer = intentAnswers[prompt.key]?.trim() || "";
        if (answer.length < MIN_INTENT_CHARS) {
          newErrors[prompt.key] = `Please write at least ${MIN_INTENT_CHARS} characters`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;

    const validationResult = onboardingSchema.safeParse({
      age: parseInt(age),
      gender,
      occupation: sanitizeString(occupation),
      bio: sanitizeString(bio),
      interestedIn: interestedIn as ("male" | "female" | "non-binary" | "everyone")[],
      minAge: parseInt(minAge),
      maxAge: parseInt(maxAge),
      maxDistance: parseInt(maxDistance),
    });

    if (!validationResult.success) {
      toast({
        title: "Validation Error",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update profile with manifesto agreement
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          age: validationResult.data.age,
          gender: validationResult.data.gender,
          occupation: validationResult.data.occupation || null,
          bio: validationResult.data.bio,
          manifesto_agreed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Upload photos
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp"].includes(fileExt) ? fileExt : "jpg";
        const fileName = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { error: photoError } = await supabase
          .from("profile_photos")
          .insert({
            user_id: user.id,
            photo_url: fileName,
            is_primary: i === 0,
            display_order: i,
          });

        if (photoError) throw photoError;
      }

      // Save preferences
      const { error: preferencesError } = await supabase
        .from("preferences")
        .upsert(
          {
            user_id: user.id,
            interested_in: validationResult.data.interestedIn,
            min_age: validationResult.data.minAge,
            max_age: validationResult.data.maxAge,
            max_distance: validationResult.data.maxDistance,
          },
          { onConflict: "user_id" },
        );

      if (preferencesError) throw preferencesError;

      // Save intent prompts (if any were answered)
      const intentPromptEntries = Object.entries(intentAnswers).filter(([_, value]) => value.trim());
      if (intentPromptEntries.length > 0) {
        for (const [key, value] of intentPromptEntries) {
          await supabase
            .from("user_intent_prompts")
            .upsert(
              {
                user_id: user.id,
                prompt_key: key,
                answer: value.trim(),
                is_public: false,
              },
              { onConflict: "user_id,prompt_key" }
            );
        }
      }

      // Initialize trust signals
      await supabase.rpc("calculate_trust_signals", { p_user_id: user.id });

      toast({
        title: "Welcome to Blossom! 🌸",
        description: "Your profile is ready. Let's find meaningful connections.",
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
    if (step === 0) {
      // Welcome step - no validation needed
      setStep(1);
      return;
    }
    if (!validateCurrentStep()) {
      return;
    }
    setStep(step + 1);
  };

  const progress = ((step) / TOTAL_STEPS) * 100;

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          {errors[field]}
        </p>
      );
    }
    return null;
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "Welcome";
      case 1:
        return "The Blossom Promise";
      case 2:
        return "Basic Info";
      case 3:
        return "Photos";
      case 4:
        return "About You";
      case 5:
        return "Preferences";
      case 6:
        return "Intentions";
      default:
        return "Complete Profile";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Dating, without the games";
      case 1:
        return "Commit to intentional dating";
      case 2:
        return "Let's start with the basics";
      case 3:
        return "Show your authentic self";
      case 4:
        return "Tell us what makes you unique";
      case 5:
        return "Who are you hoping to meet?";
      case 6:
        return "A moment of reflection (required)";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-sm text-muted-foreground">
              {step === 0 ? "Welcome" : `Step ${step} of ${TOTAL_STEPS - 1}`}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {step === 0 && <OnboardingWelcome key="step0" />}

            {/* Step 1: Manifesto Agreement */}
            {step === 1 && (
              <ManifestoAgreement
                key="step1"
                agreed={manifestoAgreed}
                onAgree={() => setManifestoAgreed(true)}
              />
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
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
                    max="120"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setErrors((prev) => ({ ...prev, age: "" }));
                    }}
                    placeholder="25"
                    aria-invalid={!!errors.age}
                  />
                  {renderError("age")}
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={gender}
                    onValueChange={(value) => {
                      setGender(value);
                      setErrors((prev) => ({ ...prev, gender: "" }));
                    }}
                  >
                    <SelectTrigger aria-invalid={!!errors.gender}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError("gender")}
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => {
                      setOccupation(e.target.value.slice(0, 100));
                      setErrors((prev) => ({ ...prev, occupation: "" }));
                    }}
                    placeholder="What do you do?"
                    maxLength={100}
                  />
                  {renderError("occupation")}
                  <p className="text-xs text-muted-foreground mt-1">
                    {occupation.length}/100 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label>Profile Photos (up to 6) *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Show your authentic self. JPEG, PNG, or WebP. Max 10MB each.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {photoPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <OptimizedImage
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
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </label>
                    )}
                  </div>
                  {renderError("photos")}
                </div>
              </motion.div>
            )}

            {/* Step 4: Bio */}
            {step === 4 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="bio">About You * (min 10 characters)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Share what makes you unique. Be genuine—it attracts the right people.
                  </p>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value.slice(0, 1000));
                      setErrors((prev) => ({ ...prev, bio: "" }));
                    }}
                    placeholder="What are you passionate about? What brings you joy?"
                    rows={6}
                    maxLength={1000}
                    aria-invalid={!!errors.bio}
                  />
                  {renderError("bio")}
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length}/1000 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Preferences */}
            {step === 5 && (
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
                              setErrors((prev) => ({ ...prev, interestedIn: "" }));
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
                  {renderError("interestedIn")}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAge">Age Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="minAge"
                        type="number"
                        value={minAge}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(18, parseInt(e.target.value) || 18));
                          setMinAge(val.toString());
                          setErrors((prev) => ({ ...prev, minAge: "" }));
                        }}
                        min="18"
                        max="100"
                      />
                      <span>to</span>
                      <Input
                        id="maxAge"
                        type="number"
                        value={maxAge}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(18, parseInt(e.target.value) || 18));
                          setMaxAge(val.toString());
                          setErrors((prev) => ({ ...prev, maxAge: "" }));
                        }}
                        min="18"
                        max="100"
                        aria-label="Maximum age"
                      />
                    </div>
                    {renderError("minAge")}
                    {renderError("maxAge")}
                  </div>
                  <div>
                    <Label htmlFor="maxDistance">Max Distance (miles)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      value={maxDistance}
                      onChange={(e) => {
                        const val = Math.min(500, Math.max(1, parseInt(e.target.value) || 1));
                        setMaxDistance(val.toString());
                        setErrors((prev) => ({ ...prev, maxDistance: "" }));
                      }}
                      min="1"
                      max="500"
                    />
                    {renderError("maxDistance")}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Intent Questions */}
            {step === 6 && (
              <IntentQuestions
                key="step6"
                answers={intentAnswers}
                onChange={handleIntentChange}
                errors={errors}
                minChars={MIN_INTENT_CHARS}
              />
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 6 ? (
              <Button onClick={nextStep} disabled={step === 1 && !manifestoAgreed}>
                {step === 0 ? (
                  <>
                    Let's Begin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : step === 1 ? (
                  "I Agree & Continue"
                ) : (
                  "Next"
                )}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating Profile..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
