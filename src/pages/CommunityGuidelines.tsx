import {
  Heart,
  Shield,
  Users,
  AlertTriangle,
  Ban,
  Eye,
  MessageCircle,
  Camera,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const guidelines = [
  {
    icon: Heart,
    title: "Be Respectful",
    description:
      "Treat others the way you want to be treated. Harassment, hate speech, and discrimination have no place on Blossom.",
    rules: [
      "No bullying, threats, or intimidation",
      "No hate speech based on race, ethnicity, religion, gender, or sexual orientation",
      "No unsolicited explicit content",
      "Respect when someone says no or isn't interested",
    ],
  },
  {
    icon: Users,
    title: "Be Authentic",
    description:
      "Represent yourself honestly. Fake profiles undermine trust in our community.",
    rules: [
      "Use your real name and age",
      "Only upload photos of yourself",
      "Don't impersonate others",
      "Be honest about your intentions",
    ],
  },
  {
    icon: Camera,
    title: "Photo Guidelines",
    description: "Keep photos appropriate and representative of who you are.",
    rules: [
      "No nudity or sexually explicit content",
      "No photos of minors (unless it's clearly a family photo with you in it)",
      "No violent or graphic imagery",
      "Face should be clearly visible in at least one photo",
    ],
  },
  {
    icon: MessageCircle,
    title: "Messaging Etiquette",
    description: "Keep conversations respectful and consensual.",
    rules: [
      "Don't send unsolicited explicit messages",
      "Respect boundaries when someone isn't responding",
      "No spam or promotional content",
      "Don't share personal contact info too quickly",
    ],
  },
  {
    icon: Ban,
    title: "Zero Tolerance",
    description: "Some behaviors result in immediate and permanent bans.",
    rules: [
      "Any form of sexual harassment or assault",
      "Sharing others' private photos without consent",
      "Scams, fraud, or requesting money",
      "Any illegal activity",
      "Accounts for users under 18 years old",
    ],
  },
  {
    icon: Eye,
    title: "Content Moderation",
    description: "We actively monitor our platform to keep everyone safe.",
    rules: [
      "AI-powered detection of inappropriate content",
      "Human review team for reported content",
      "24-48 hour response time for reports",
      "Appeals process for account actions",
    ],
  },
];

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
      <Helmet>
        <title>Community Guidelines | Blossom</title>
        <meta
          name="description"
          content="Learn about Blossom's community guidelines and content moderation policies. We're committed to creating a safe and respectful dating environment."
        />
      </Helmet>

      <Navbar />

      <main className="w-full px-4 py-12 max-w-4xl mx-auto box-border">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 text-primary">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">Community Guidelines</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Blossom is built on respect, authenticity, and safety. These
            guidelines help us maintain a positive environment for everyone.
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-semibold text-lg mb-2">
                Our Commitment to Safety
              </h2>
              <p className="text-muted-foreground">
                Every member of Blossom agrees to follow these guidelines.
                Violations may result in warnings, temporary suspensions, or
                permanent bans depending on severity. We review all reports and
                take action to protect our community.
              </p>
            </div>
          </div>
        </Card>

        {/* Guidelines Grid */}
        <div className="space-y-6">
          {guidelines.map((guideline, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 shrink-0">
                  <guideline.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {guideline.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {guideline.description}
                  </p>
                  <ul className="space-y-2">
                    {guideline.rules.map((rule, ruleIndex) => (
                      <li
                        key={ruleIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reporting Section */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">How to Report</h2>
          <p className="text-muted-foreground mb-4">
            If you encounter behavior that violates these guidelines, please
            report it immediately:
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                1
              </span>
              <span>
                On any profile or in chat, tap the menu icon (three dots) and
                select "Report"
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                2
              </span>
              <span>Choose the category that best describes the issue</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                3
              </span>
              <span>
                Provide any additional details that can help us investigate
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                4
              </span>
              <span>
                Our team will review within 24-48 hours and take appropriate
                action
              </span>
            </li>
          </ol>
        </Card>

        {/* Contact */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>
            Questions about these guidelines?{" "}
            <a href="/support" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
          <p className="text-sm mt-2">Last updated: January 2025</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
