import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  Users,
  Mail,
  Trash2,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Blossom Dating</title>
        <meta
          name="description"
          content="Learn how Blossom Dating protects your privacy and handles your personal data. Our commitment to keeping your information safe."
        />
      </Helmet>

      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
        <Navbar />

        <main className="w-full max-w-4xl mx-auto px-4 py-12 box-border">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Blossom Dating ("we," "our," or "us"). We are
                committed to protecting your privacy and ensuring you have a
                positive experience on our platform. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our mobile application and website.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Date of birth and gender</li>
                    <li>Profile photos and bio information</li>
                    <li>Location data (with your permission)</li>
                    <li>Preferences and interests</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Usage Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>How you interact with other users</li>
                    <li>Messages and communications within the app</li>
                    <li>Device information and IP address</li>
                    <li>App usage patterns and preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To create and manage your account</li>
                <li>To match you with compatible users</li>
                <li>To facilitate communication between users</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To send you important updates and notifications</li>
                <li>To improve our services and develop new features</li>
                <li>To ensure safety and enforce our community guidelines</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We may use behavioral signals such as responsiveness, completion
                of required flows, and reports or blocks to support community
                safety and improve matching quality.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Information Sharing
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>With other users:</strong> Your profile information
                    is visible to other users as part of the service
                  </li>
                  <li>
                    <strong>Service providers:</strong> Third parties who help
                    us operate and improve our services
                  </li>
                  <li>
                    <strong>Legal requirements:</strong> When required by law or
                    to protect our rights
                  </li>
                  <li>
                    <strong>Business transfers:</strong> In connection with a
                    merger, acquisition, or sale of assets
                  </li>
                </ul>
                <p className="font-medium text-foreground">
                  We do not sell your personal information to third parties for
                  marketing purposes.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary" />
                Push Notifications & Communications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                With your consent, we may send you push notifications about
                matches, messages, and app updates. You can manage your
                notification preferences in your device settings or within the
                app. We may also send you email communications about your
                account, security updates, and service changes.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your
                personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Encryption of data in transit and at rest</li>
                <li>
                  Secure authentication mechanisms including two-factor
                  authentication
                </li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training</li>
                <li>Breach detection and incident response procedures</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-primary" />
                Your Rights & Choices
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal
                    data
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your account
                    and data
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a
                    portable format
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </li>
                  <li>
                    <strong>Withdraw consent:</strong> Revoke previously given
                    consent
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us at{" "}
                  <a
                    href="mailto:contact.blossomapp@gmail.com"
                    className="text-primary hover:underline"
                  >
                    contact.blossomapp@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">Blossom Dating</p>
                <p className="text-muted-foreground">
                  Email: contact.blossomapp@gmail.com
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4">
                Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on this page and updating the "Last updated" date. We
                encourage you to review this Privacy Policy periodically for any
                changes.
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
