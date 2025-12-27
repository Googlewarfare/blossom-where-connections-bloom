import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: "Contains lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: "Contains a number",
    test: (p) => /[0-9]/.test(p),
  },
  {
    label: "Contains special character",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export const getPasswordStrength = (password: string): number => {
  return requirements.filter((req) => req.test(password)).length;
};

export const isPasswordStrong = (password: string): boolean => {
  // Require at least 4 out of 5 requirements (all but special char can be optional)
  return getPasswordStrength(password) >= 4;
};

export const PasswordStrengthMeter = ({
  password,
  className,
}: PasswordStrengthMeterProps) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const metRequirements = useMemo(
    () => requirements.map((req) => ({ ...req, met: req.test(password) })),
    [password]
  );

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: "", color: "" };
    if (strength <= 1) return { label: "Weak", color: "text-destructive" };
    if (strength <= 2) return { label: "Fair", color: "text-orange-500" };
    if (strength <= 3) return { label: "Good", color: "text-yellow-500" };
    if (strength <= 4) return { label: "Strong", color: "text-green-500" };
    return { label: "Very Strong", color: "text-green-600" };
  };

  const getBarColor = (index: number) => {
    if (password.length === 0) return "bg-muted";
    if (index >= strength) return "bg-muted";
    if (strength <= 1) return "bg-destructive";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const { label, color } = getStrengthLabel();

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={cn("text-xs font-medium", color)}>{label}</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                getBarColor(index)
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {metRequirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              req.met ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
