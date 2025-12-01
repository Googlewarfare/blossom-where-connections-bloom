import { useProfileCompletion } from "@/hooks/use-profile-completion";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ProfileCompletionBanner = () => {
  const { completion, loading } = useProfileCompletion();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (loading || completion.isComplete || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Complete Your Profile
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {completion.percentage}% complete - Stand out and get more matches!
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDismissed(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </Button>
                </div>

                <Progress value={completion.percentage} className="h-2" />

                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-2"
                  >
                    {completion.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={
                            item.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="rounded-full"
                  >
                    Complete Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="rounded-full"
                  >
                    {expanded ? "Hide" : "Show"} Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
