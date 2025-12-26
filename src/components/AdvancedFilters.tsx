import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cmToFeetInches } from "@/lib/location-utils";

interface AdvancedFiltersProps {
  onFiltersApplied: () => void;
}

export const AdvancedFilters = ({ onFiltersApplied }: AdvancedFiltersProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [heightRange, setHeightRange] = useState<[number, number]>([150, 200]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string[]>([]);
  const [selectedDrinking, setSelectedDrinking] = useState<string[]>([]);
  const [selectedSmoking, setSelectedSmoking] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string[]>([]);
  const [selectedReligion, setSelectedReligion] = useState<string[]>([]);

  const educationOptions = [
    "High School",
    "Some College",
    "Bachelors",
    "Masters",
    "PhD",
    "Trade School",
  ];
  const lifestyleOptions = [
    "Active",
    "Relaxed",
    "Social Butterfly",
    "Homebody",
    "Adventurous",
  ];
  const goalOptions = ["Relationship", "Dating", "New Friends", "Not Sure"];
  const drinkingOptions = [
    "Never",
    "Socially",
    "Regularly",
    "Prefer not to say",
  ];
  const smokingOptions = ["Never", "Socially", "Regularly", "Trying to quit"];
  const exerciseOptions = ["Daily", "Few times a week", "Sometimes", "Never"];
  const religionOptions = [
    "Christian",
    "Muslim",
    "Jewish",
    "Hindu",
    "Buddhist",
    "Spiritual",
    "Agnostic",
    "Atheist",
    "Other",
  ];

  const toggleSelection = (
    value: string,
    list: string[],
    setter: (val: string[]) => void,
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleApply = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("preferences")
        .update({
          min_height_cm: heightRange[0],
          max_height_cm: heightRange[1],
          education_preference:
            selectedEducation.length > 0 ? selectedEducation : null,
          lifestyle_preference:
            selectedLifestyle.length > 0 ? selectedLifestyle : null,
          relationship_goal_preference:
            selectedGoal.length > 0 ? selectedGoal : null,
          drinking_preference:
            selectedDrinking.length > 0 ? selectedDrinking : null,
          smoking_preference:
            selectedSmoking.length > 0 ? selectedSmoking : null,
          exercise_preference:
            selectedExercise.length > 0 ? selectedExercise : null,
          religion_preference:
            selectedReligion.length > 0 ? selectedReligion : null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Filters applied");
      setOpen(false);
      onFiltersApplied();
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    }
  };

  const handleClearAll = () => {
    setHeightRange([150, 200]);
    setSelectedEducation([]);
    setSelectedLifestyle([]);
    setSelectedGoal([]);
    setSelectedDrinking([]);
    setSelectedSmoking([]);
    setSelectedExercise([]);
    setSelectedReligion([]);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your matches with detailed preferences
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Height Range */}
          <div className="space-y-3">
            <Label>
              Height:{" "}
              {(() => {
                const min = cmToFeetInches(heightRange[0]);
                const max = cmToFeetInches(heightRange[1]);
                return `${min.feet}'${min.inches}" - ${max.feet}'${max.inches}"`;
              })()}
            </Label>
            <Slider
              value={heightRange}
              onValueChange={(val) => setHeightRange(val as [number, number])}
              min={140}
              max={220}
              step={1}
            />
          </div>

          {/* Education */}
          <div className="space-y-3">
            <Label>Education</Label>
            <div className="flex flex-wrap gap-2">
              {educationOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedEducation.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(
                      option,
                      selectedEducation,
                      setSelectedEducation,
                    )
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="space-y-3">
            <Label>Lifestyle</Label>
            <div className="flex flex-wrap gap-2">
              {lifestyleOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedLifestyle.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(
                      option,
                      selectedLifestyle,
                      setSelectedLifestyle,
                    )
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Relationship Goal */}
          <div className="space-y-3">
            <Label>Looking For</Label>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedGoal.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(option, selectedGoal, setSelectedGoal)
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Drinking */}
          <div className="space-y-3">
            <Label>Drinking</Label>
            <div className="flex flex-wrap gap-2">
              {drinkingOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedDrinking.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(
                      option,
                      selectedDrinking,
                      setSelectedDrinking,
                    )
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Smoking */}
          <div className="space-y-3">
            <Label>Smoking</Label>
            <div className="flex flex-wrap gap-2">
              {smokingOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedSmoking.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(option, selectedSmoking, setSelectedSmoking)
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Exercise */}
          <div className="space-y-3">
            <Label>Exercise</Label>
            <div className="flex flex-wrap gap-2">
              {exerciseOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedExercise.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(
                      option,
                      selectedExercise,
                      setSelectedExercise,
                    )
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Religion */}
          <div className="space-y-3">
            <Label>Religion</Label>
            <div className="flex flex-wrap gap-2">
              {religionOptions.map((option) => (
                <Badge
                  key={option}
                  variant={
                    selectedReligion.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleSelection(
                      option,
                      selectedReligion,
                      setSelectedReligion,
                    )
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClearAll} className="flex-1">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
