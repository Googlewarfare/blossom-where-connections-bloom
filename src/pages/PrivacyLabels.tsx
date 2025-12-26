import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Camera,
  MessageSquare,
  CreditCard,
  Activity,
  Shield,
  Eye,
} from "lucide-react";

const dataCategories = [
  {
    icon: User,
    category: "Contact Info",
    types: ["Name", "Email Address", "Phone Number"],
    purpose: "Used for account creation, communication, and account recovery",
    linked: true,
  },
  {
    icon: MapPin,
    category: "Location",
    types: ["Precise Location", "Coarse Location"],
    purpose: "Used to show nearby matches and events in your area",
    linked: true,
  },
  {
    icon: Camera,
    category: "Photos & Videos",
    types: ["Profile Photos", "Verification Photos", "Chat Media"],
    purpose: "Used for profile display, identity verification, and messaging",
    linked: true,
  },
  {
    icon: MessageSquare,
    category: "User Content",
    types: ["Messages", "Profile Bio", "Interests"],
    purpose: "Used for matching, communication, and personalization",
    linked: true,
  },
  {
    icon: CreditCard,
    category: "Financial Info",
    types: ["Payment Info"],
    purpose: "Processed by Apple/payment providers for subscriptions",
    linked: false,
  },
  {
    icon: Activity,
    category: "Usage Data",
    types: ["App Interactions", "Browsing History"],
    purpose: "Used to improve the app experience and provide analytics",
    linked: true,
  },
  {
    icon: Shield,
    category: "Identifiers",
    types: ["User ID", "Device ID"],
    purpose: "Used for account management and security",
    linked: true,
  },
];

const PrivacyLabels = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>App Privacy | Blossom</title>
        <meta
          name="description"
          content="Learn about what data Blossom collects and how we use it to provide you with a safe dating experience."
        />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 text-primary">
            <Eye className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">App Privacy</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This page describes the data Blossom collects and how it's used.
            This information is also displayed on the App Store.
          </p>
        </div>

        {/* Data Used to Track You */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-600 border-green-500/30"
              >
                No Tracking
              </Badge>
              Data Used to Track You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Blossom does not use any data to track you across apps or websites
              owned by other companies.
            </p>
          </CardContent>
        </Card>

        {/* Data Linked to You */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Data Linked to You</CardTitle>
            <p className="text-sm text-muted-foreground">
              The following data may be collected and linked to your identity:
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dataCategories
                .filter((cat) => cat.linked)
                .map((category, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{category.category}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {category.types.map((type, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.purpose}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Not Linked to You */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Data Not Linked to You</CardTitle>
            <p className="text-sm text-muted-foreground">
              The following data may be collected but is not linked to your
              identity:
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dataCategories
                .filter((cat) => !cat.linked)
                .map((category, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{category.category}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {category.types.map((type, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.purpose}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Our Privacy Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Data Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted in transit and at rest using
                  industry-standard encryption.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Data Deletion</h4>
                <p className="text-sm text-muted-foreground">
                  You can delete your account and all associated data at any
                  time from your profile settings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">No Data Selling</h4>
                <p className="text-sm text-muted-foreground">
                  We never sell your personal data to third parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyLabels;
