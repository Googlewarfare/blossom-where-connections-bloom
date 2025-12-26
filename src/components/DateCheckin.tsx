import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface TrustedContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface DateCheckin {
  id: string;
  date_location: string | null;
  date_time: string;
  expected_end_time: string;
  status: string;
  trusted_contact_id: string;
  notes: string | null;
  last_checkin_at: string | null;
}

const DateCheckin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddContact, setShowAddContact] = useState(false);
  const [showNewCheckin, setShowNewCheckin] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Checkin form state
  const [selectedContact, setSelectedContact] = useState("");
  const [dateLocation, setDateLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [notes, setNotes] = useState("");

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
    enabled: !!user,
  });

  // Fetch active check-ins
  const { data: checkins = [] } = useQuery({
    queryKey: ["date-checkins", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("date_checkins")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["scheduled", "active"])
        .order("date_time", { ascending: true });
      if (error) throw error;
      return data as DateCheckin[];
    },
    enabled: !!user,
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
        description: "Trusted contact has been saved.",
      });
      setShowAddContact(false);
      setContactName("");
      setContactPhone("");
      setContactEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact.",
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
        dateTimeObj.getTime() + parseInt(duration) * 60 * 60 * 1000,
      );

      const { error } = await supabase.from("date_checkins").insert({
        user_id: user.id,
        trusted_contact_id: selectedContact,
        date_location: dateLocation || null,
        date_time: dateTimeObj.toISOString(),
        expected_end_time: endTime.toISOString(),
        notes: notes || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["date-checkins"] });
      toast({
        title: "Check-in Created",
        description: "Your date check-in has been scheduled.",
      });
      setShowNewCheckin(false);
      setSelectedContact("");
      setDateLocation("");
      setDateTime("");
      setDuration("2");
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create check-in.",
        variant: "destructive",
      });
    },
  });

  // Complete check-in mutation
  const completeCheckin = useMutation({
    mutationFn: async (checkinId: string) => {
      const { error } = await supabase
        .from("date_checkins")
        .update({
          status: "completed",
          last_checkin_at: new Date().toISOString(),
        })
        .eq("id", checkinId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["date-checkins"] });
      toast({
        title: "Checked In",
        description: "You've marked yourself as safe.",
      });
    },
  });

  // Cancel check-in mutation
  const cancelCheckin = useMutation({
    mutationFn: async (checkinId: string) => {
      const { error } = await supabase
        .from("date_checkins")
        .update({ status: "cancelled" })
        .eq("id", checkinId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["date-checkins"] });
      toast({
        title: "Cancelled",
        description: "Date check-in has been cancelled.",
      });
    },
  });

  const getContactById = (id: string) => contacts.find((c) => c.id === id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Date Check-in
        </CardTitle>
        <CardDescription>
          Share your date details with a trusted contact for safety
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trusted Contacts Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Trusted Contacts</Label>
            <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Trusted Contact</DialogTitle>
                  <DialogDescription>
                    This person will be notified if you don't check in after a
                    date
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Mom, Best Friend, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <Button
                    onClick={() => addContact.mutate()}
                    disabled={!contactName || addContact.isPending}
                    className="w-full"
                  >
                    {addContact.isPending ? "Saving..." : "Save Contact"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No trusted contacts yet. Add one to get started.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {contacts.map((contact) => (
                <Badge
                  key={contact.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {contact.name}
                  {contact.phone && <Phone className="h-3 w-3" />}
                  {contact.email && <Mail className="h-3 w-3" />}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Active Check-ins */}
        {checkins.length > 0 && (
          <div className="space-y-2">
            <Label>Active Check-ins</Label>
            {checkins.map((checkin) => {
              const contact = getContactById(checkin.trusted_contact_id);
              return (
                <div
                  key={checkin.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        checkin.status === "active" ? "default" : "secondary"
                      }
                    >
                      {checkin.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Contact: {contact?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {checkin.date_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {checkin.date_location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{" "}
                      {format(new Date(checkin.date_time), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => completeCheckin.mutate(checkin.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" /> I'm Safe
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelCheckin.mutate(checkin.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Check-in */}
        <Dialog open={showNewCheckin} onOpenChange={setShowNewCheckin}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={contacts.length === 0}>
              <Shield className="mr-2 h-4 w-4" />
              Schedule Date Check-in
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Date Check-in</DialogTitle>
              <DialogDescription>
                Your trusted contact will be alerted if you don't check in
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Trusted Contact *</Label>
                <Select
                  value={selectedContact}
                  onValueChange={setSelectedContact}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
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
                <Label>Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Expected Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location (optional)</Label>
                <Input
                  value={dateLocation}
                  onChange={(e) => setDateLocation(e.target.value)}
                  placeholder="Restaurant name, address, etc."
                />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details..."
                  rows={2}
                />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your contact will receive details about your date and be
                  alerted if you don't check in.
                </p>
              </div>
              <Button
                onClick={() => createCheckin.mutate()}
                disabled={
                  !selectedContact || !dateTime || createCheckin.isPending
                }
                className="w-full"
              >
                {createCheckin.isPending ? "Creating..." : "Create Check-in"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DateCheckin;
