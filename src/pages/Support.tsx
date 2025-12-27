import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Mail,
  MessageCircle,
  Shield,
  HelpCircle,
  Clock,
  Phone,
  Globe,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "How do I verify my profile?",
    answer:
      "Go to your Profile page, then tap 'Get Verified' in the verification section. Follow the prompts to take a selfie that matches a specific pose. Our team will review it within 24-48 hours.",
  },
  {
    question: "How do I report someone?",
    answer:
      "On any profile or in a chat, tap the three-dot menu and select 'Report'. Choose a reason and provide details. All reports are reviewed by our safety team.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to your Profile page, scroll down to the Security tab, and tap 'Delete Account'. This action is permanent and cannot be undone.",
  },
  {
    question: "How does matching work?",
    answer:
      "When you like someone and they like you back, it's a match! You'll both be notified and can start chatting immediately.",
  },
  {
    question: "What is Blossom Premium?",
    answer:
      "Premium gives you unlimited likes, the ability to see who liked you, read receipts, and advanced filters. Check the Premium page for current pricing.",
  },
  {
    question: "How do I change my location?",
    answer:
      "Go to your Profile page and update your location in the basic info section. You can also use the location button to auto-detect your current location.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "If you subscribed via the iOS app, manage your subscription in Settings > Apple ID > Subscriptions. If you subscribed via web, use the 'Manage Subscription' option on the Premium page.",
  },
  {
    question: "How do I restore my purchases?",
    answer:
      "Open the Premium page and tap 'Restore Purchases'. This will restore any active subscriptions linked to your Apple ID or account.",
  },
];

const Support = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    // Simulate sending (in production, this would call an edge function)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24-48 hours.",
    });

    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
      <Helmet>
        <title>Help & Support | Blossom</title>
        <meta
          name="description"
          content="Get help with your Blossom account. Find answers to frequently asked questions or contact our support team."
        />
      </Helmet>

      <Navbar />

      <main className="w-full px-4 py-12 max-w-4xl mx-auto box-border">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 text-primary">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find answers to common questions or reach out to our team. We're
            here to help you have the best experience on Blossom.
          </p>
        </div>

        {/* Support Info Banner */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Response Time</h3>
                <p className="text-sm text-muted-foreground">24-48 hours</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Available</h3>
                <p className="text-sm text-muted-foreground">7 days a week</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  support@blossom.app
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card
            className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => (window.location.href = "/safety")}
          >
            <Shield className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm mb-1">Safety Center</h3>
            <p className="text-xs text-muted-foreground">Dating safety tips</p>
          </Card>

          <Card
            className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => (window.location.href = "/privacy")}
          >
            <MessageCircle className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm mb-1">Privacy Policy</h3>
            <p className="text-xs text-muted-foreground">How we protect data</p>
          </Card>

          <Card
            className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => (window.location.href = "/terms")}
          >
            <Heart className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm mb-1">Terms of Service</h3>
            <p className="text-xs text-muted-foreground">Usage guidelines</p>
          </Card>

          <Card
            className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => (window.location.href = "/community-guidelines")}
          >
            <Globe className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm mb-1">Community</h3>
            <p className="text-xs text-muted-foreground">Our guidelines</p>
          </Card>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        {/* Contact Form */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What is this about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">How can we help? *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {message.length}/2000 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={sending}
              >
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Email us directly:
                  </p>
                  <a
                    href="mailto:support@blossom.app"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    support@blossom.app
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    For urgent safety issues:
                  </p>
                  <a
                    href="mailto:safety@blossom.app"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    safety@blossom.app
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* App Version Info */}
        <Card className="p-6 text-center bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">
            Blossom Dating App
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline">Version 1.0.0</Badge>
            <Badge variant="outline">iOS & Android</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © 2025 Blossom. All rights reserved.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
