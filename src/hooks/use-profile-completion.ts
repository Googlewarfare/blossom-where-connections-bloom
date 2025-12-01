import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ProfileCompletionItem {
  label: string;
  completed: boolean;
  route?: string;
}

interface ProfileCompletion {
  percentage: number;
  items: ProfileCompletionItem[];
  isComplete: boolean;
}

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [completion, setCompletion] = useState<ProfileCompletion>({
    percentage: 0,
    items: [],
    isComplete: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkCompletion = async () => {
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Fetch photos
        const { data: photos } = await supabase
          .from("profile_photos")
          .select("id")
          .eq("user_id", user.id);

        // Fetch preferences
        const { data: preferences } = await supabase
          .from("preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const items: ProfileCompletionItem[] = [
          {
            label: "Add your age",
            completed: !!profile?.age,
            route: "/profile",
          },
          {
            label: "Set your gender",
            completed: !!profile?.gender,
            route: "/profile",
          },
          {
            label: "Add profile photos",
            completed: (photos?.length || 0) >= 1,
            route: "/profile",
          },
          {
            label: "Write a bio",
            completed: !!profile?.bio && profile.bio.length > 10,
            route: "/profile",
          },
          {
            label: "Add your occupation",
            completed: !!profile?.occupation,
            route: "/profile",
          },
          {
            label: "Set dating preferences",
            completed: !!preferences && preferences.interested_in?.length > 0,
            route: "/profile",
          },
        ];

        const completedCount = items.filter((item) => item.completed).length;
        const percentage = Math.round((completedCount / items.length) * 100);

        setCompletion({
          percentage,
          items,
          isComplete: percentage === 100,
        });
      } catch (error) {
        console.error("Error checking profile completion:", error);
      } finally {
        setLoading(false);
      }
    };

    checkCompletion();
  }, [user]);

  return { completion, loading };
};
