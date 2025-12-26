import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileText,
  Users,
  Shield,
  AlertTriangle,
  CreditCard,
  Scale,
  Mail,
} from "lucide-react";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Blossom Dating</title>
        <meta
          name="description"
          content="Read the Terms of Service for Blossom Dating. Understand the rules and guidelines for using our platform."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto max-w-4xl px-4 py-12">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Blossom Dating ("the Service"), you agree
                to be bound by these Terms of Service. If you do not agree to
                these terms, please do not use our Service. These terms apply to
                all users, including visitors, registered users, and premium
                subscribers.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Eligibility
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>To use Blossom Dating, you must:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Be at least 18 years of age</li>
                  <li>
                    Be legally permitted to use the Service in your jurisdiction
                  </li>
                  <li>
                    Not be prohibited from using the Service under applicable
                    laws
                  </li>
                  <li>Not have been previously banned from the Service</li>
                  <li>Create only one account for personal use</li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Your Account
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>When creating an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as needed</li>
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Community Guidelines
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post false, misleading, or deceptive content</li>
                  <li>Share inappropriate, explicit, or offensive material</li>
                  <li>Impersonate others or create fake profiles</li>
                  <li>
                    Use the Service for commercial purposes or solicitation
                  </li>
                  <li>Attempt to hack, disrupt, or compromise the Service</li>
                  <li>Collect information about other users without consent</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
                <p className="font-medium text-foreground">
                  Violations may result in immediate account termination without
                  notice.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                Premium Services & Payments
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>For premium subscriptions and in-app purchases:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>
                    Cancel at least 24 hours before renewal to avoid charges
                  </li>
                  <li>
                    Refunds are subject to our refund policy and app store
                    policies
                  </li>
                  <li>Prices may change with reasonable notice</li>
                  <li>Premium features are for personal use only</li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                Limitation of Liability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Service is provided "as is" without warranties of any
                  kind. We are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Actions or behavior of other users</li>
                  <li>Accuracy of user-provided information</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Any indirect, incidental, or consequential damages</li>
                  <li>Outcomes of interactions made through the Service</li>
                </ul>
                <p>
                  You use the Service at your own risk and are responsible for
                  your safety when meeting other users in person.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4">
                Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service, including its design, features, and content, is
                owned by Blossom Dating and protected by intellectual property
                laws. You retain ownership of content you post but grant us a
                license to use, display, and distribute it within the Service.
                You may not copy, modify, or distribute our proprietary content
                without permission.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your account at any time for
                violations of these terms or for any other reason at our
                discretion. You may delete your account at any time through the
                app settings. Upon termination, your right to use the Service
                ceases immediately, but these terms will continue to apply to
                your past use.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these terms at any time. Material changes will be
                communicated through the app or email. Continued use of the
                Service after changes constitutes acceptance of the new terms.
                If you disagree with changes, you should stop using the Service.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">Blossom Dating</p>
                <p className="text-muted-foreground">
                  Email: legal@blossomapp.com
                </p>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
