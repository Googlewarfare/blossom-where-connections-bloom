import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Heart, Plus, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TrustedContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface QuickSafetyCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "checkin" | "contact";
  matchName?: string;
}

export const QuickSafetyCheckin = ({
  isOpen,
  onClose,
  mode,
  matchName,
}: QuickSafetyCheckinProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Check-in form state
  const [selectedContact, setSelectedContact] = useState("");
  const [dateLocation, setDateLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState("2");

  // Fetch trusted contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ["trusted-contacts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TrustedContact[];
    },
    enabled: !!user && isOpen,
  });

  // Add contact mutation
  const addContact = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("trusted_contacts").insert({
        user_id: user.id,
        name: contactName,
        phone: contactPhone || null,
        email: contactEmail || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-contacts"] });
      toast({
        title: "Contact Added",
        description: "Your trusted contact has been saved. They'll be there when you need them.",
      });
      onClose();
      resetContactForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create check-in mutation
  const createCheckin = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const dateTimeObj = new Date(dateTime);
      const endTime = new Date(
        dateTimeObj.getTime() + parseInt(duration) * 60 * 60 * 1000
      );

      const { error } = await supabase.from("date_checkins").insert({
        user_id: user.id,
        trusted_contact_id: selectedContact,
        date_location: dateLocation || null,
        date_time: dateTimeObj.toISOString(),
        expected_end_time: endTime.toISOString(),
        notes: matchName ? `Date with ${matchName}` : null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["date-checkins"] });
      toast({
        title: "Check-in Scheduled",
        description: "Your trusted contact will be notified. Have a wonderful time!",
      });
      onClose();
      resetCheckinForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetContactForm = () => {
    setContactName("");
    setContactPhone("");
    setContactEmail("");
  };

  const resetCheckinForm = () => {
    setSelectedContact("");
    setDateLocation("");
    setDateTime("");
    setDuration("2");
  };

  const handleClose = () => {
    onClose();
    if (mode === "contact") {
      resetContactForm();
    } else {
      resetCheckinForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              {mode === "contact" ? (
                <UserPlus className="h-5 w-5 text-primary" />
              ) : (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>
                {mode === "contact" ? "Add Trusted Contact" : "Schedule Check-in"}
              </DialogTitle>
              <DialogDescription>
                {mode === "contact"
                  ? "Someone you trust who can be notified about your dates"
                  : "Let someone know where you'll be"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === "contact" ? (
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Best friend, Mom, Roommate..."
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
              <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Your contact's info stays private. They'll only be notified if you schedule a check-in.
              </p>
            </div>
            <Button
              onClick={() => addContact.mutate()}
              disabled={!contactName || addContact.isPending}
              className="w-full"
            >
              {addContact.isPending ? "Saving..." : "Add Contact"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {contacts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">
                  Add a trusted contact first
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    // Will need to switch mode - handled by parent
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label>Who should we notify? *</Label>
                  <Select value={selectedContact} onValueChange={setSelectedContact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your trusted contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>When is your date? *</Label>
                  <Input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>How long do you expect to be?</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">About 1 hour</SelectItem>
                      <SelectItem value="2">About 2 hours</SelectItem>
                      <SelectItem value="3">About 3 hours</SelectItem>
                      <SelectItem value="4">About 4 hours</SelectItem>
                      <SelectItem value="6">Half a day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Where are you meeting? (optional)</Label>
                  <Input
                    value={dateLocation}
                    onChange={(e) => setDateLocation(e.target.value)}
                    placeholder="Coffee shop, restaurant, park..."
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                  <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    We'll remind you to check in when your date ends. Your contact will only be alerted if you don't respond.
                  </p>
                </div>
                <Button
                  onClick={() => createCheckin.mutate()}
                  disabled={!selectedContact || !dateTime || createCheckin.isPending}
                  className="w-full"
                >
                  {createCheckin.isPending ? "Creating..." : "Schedule Check-in"}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickSafetyCheckin;
