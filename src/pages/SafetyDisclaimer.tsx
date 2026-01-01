import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  AlertTriangle,
  Users,
  MapPin,
  Phone,
  Heart,
  CheckCircle,
  Mail,
} from "lucide-react";

const SafetyDisclaimer = () => {
  return (
    <>
      <Helmet>
        <title>Safety Disclaimer - Blossom Dating</title>
        <meta
          name="description"
          content="Important safety information for Blossom Dating users. Learn how to stay safe while using our platform and meeting new people."
        />
      </Helmet>

      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
        <Navbar />

        <main className="w-full max-w-4xl mx-auto px-4 py-12 box-border">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Safety Disclaimer</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Important Notice
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                While Blossom Dating is committed to fostering a safe and
                respectful community, we cannot guarantee the behavior, identity,
                or intentions of any user on our platform. By using Blossom
                Dating, you acknowledge that you are solely responsible for your
                own safety when interacting with other users, both online and in
                person. This disclaimer outlines important safety considerations
                and your responsibilities as a user.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                User Verification Limitations
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Although we offer optional identity verification features,
                  please understand:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Verification confirms identity at a point in time but does
                    not guarantee ongoing behavior or intentions
                  </li>
                  <li>
                    Not all users choose to complete verification, and
                    unverified users are not necessarily untrustworthy
                  </li>
                  <li>
                    Background checks, where available, may not reveal all
                    relevant information
                  </li>
                  <li>
                    No verification system is foolproof; always exercise your
                    own judgment
                  </li>
                  <li>
                    A verification badge does not constitute an endorsement or
                    guarantee by Blossom Dating
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Heart className="w-6 h-6 text-primary" />
                Online Communication Safety
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>When communicating through the app:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Do not share sensitive personal information such as your
                    home address, workplace, or financial details
                  </li>
                  <li>
                    Be cautious of users who ask for money or financial
                    assistance
                  </li>
                  <li>
                    Report any suspicious behavior, harassment, or inappropriate
                    content immediately
                  </li>
                  <li>
                    Trust your instincts—if something feels wrong, it probably is
                  </li>
                  <li>
                    Keep conversations on the platform until you feel comfortable
                    and have verified the person's identity
                  </li>
                  <li>
                    Be wary of users who refuse to video chat or meet in person
                    after extended communication
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                Meeting in Person
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you decide to meet someone from Blossom Dating in person:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Always meet in a public place with other people around
                  </li>
                  <li>
                    Tell a friend or family member where you are going, who you
                    are meeting, and when you expect to return
                  </li>
                  <li>
                    Arrange your own transportation to and from the meeting
                    location
                  </li>
                  <li>
                    Stay sober and alert; avoid excessive alcohol consumption
                  </li>
                  <li>
                    Keep your phone charged and accessible at all times
                  </li>
                  <li>
                    Use our Date Check-in feature to share your location with a
                    trusted contact
                  </li>
                  <li>
                    Do not go to a private location on the first meeting
                  </li>
                  <li>
                    Trust your instincts—leave immediately if you feel
                    uncomfortable or unsafe
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                Your Responsibilities
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>As a user of Blossom Dating, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Take responsibility for your own safety and well-being
                  </li>
                  <li>
                    Conduct your own due diligence before meeting anyone in
                    person
                  </li>
                  <li>
                    Report any users who violate our Community Guidelines or
                    make you feel unsafe
                  </li>
                  <li>
                    Not hold Blossom Dating liable for the actions, behavior, or
                    conduct of any user
                  </li>
                  <li>
                    Understand that interactions with other users are at your
                    own risk
                  </li>
                  <li>
                    Follow all applicable laws and regulations when using our
                    platform
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Phone className="w-6 h-6 text-primary" />
                Emergency Situations
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you ever feel in immediate danger or witness a crime:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Contact local emergency services immediately (911 in the
                    United States)
                  </li>
                  <li>
                    Remove yourself from the situation as quickly and safely as
                    possible
                  </li>
                  <li>
                    After ensuring your safety, report the incident to our
                    support team
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="font-medium text-destructive">
                    Blossom Dating is not a substitute for emergency services.
                    Always contact local authorities if you are in danger.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Limitation of Liability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To the fullest extent permitted by applicable law, Blossom
                  Dating, its affiliates, officers, employees, agents, partners,
                  and licensors shall not be liable for:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Any direct, indirect, incidental, special, consequential, or
                    punitive damages arising from your use of the platform
                  </li>
                  <li>
                    Any conduct, actions, or behavior of other users, whether
                    online or offline
                  </li>
                  <li>
                    Any physical, emotional, psychological, or financial harm
                    resulting from interactions with other users
                  </li>
                  <li>
                    Any criminal acts committed by users of the platform
                  </li>
                  <li>
                    The accuracy, completeness, or reliability of any
                    information provided by users
                  </li>
                </ul>
                <p className="font-medium text-foreground">
                  You use Blossom Dating entirely at your own risk.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Safety Disclaimer or need to
                report a safety concern, please contact us at:
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
                Changes to This Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Safety Disclaimer from time to time. We will
                notify you of any material changes by posting the updated
                disclaimer on this page and updating the "Last updated" date. Your
                continued use of Blossom Dating after any changes constitutes
                acceptance of the updated disclaimer.
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SafetyDisclaimer;
