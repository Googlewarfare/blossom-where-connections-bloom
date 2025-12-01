import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface WelcomeEmailProps {
  firstName: string;
  profileUrl: string;
}

export const WelcomeEmail = ({
  firstName = 'there',
  profileUrl = '',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Blossom - Your journey to meaningful connections starts now! 🌸</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with gradient */}
        <Section style={header}>
          <Heading style={headerText}>🌸 Blossom</Heading>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h1}>Welcome to Blossom, {firstName}!</Heading>
          
          <Text style={paragraph}>
            We're thrilled to have you join our community! Your journey to meaningful 
            connections starts now.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              <strong>✨ What's Next?</strong>
            </Text>
            <Text style={listItem}>📸 Complete your profile with photos</Text>
            <Text style={listItem}>💝 Add your interests and preferences</Text>
            <Text style={listItem}>🗺️ Start discovering amazing people nearby</Text>
            <Text style={listItem}>💕 Begin your journey to finding love</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href={profileUrl} style={button}>
              Complete Your Profile
            </Link>
          </Section>

          <Text style={paragraph}>
            Ready to make your profile shine? Add photos, share your interests, and 
            let others know what makes you unique.
          </Text>

          <Hr style={hr} />

          <Text style={smallText}>
            <strong>💡 Pro Tips:</strong>
          </Text>
          <Text style={smallText}>
            • Use high-quality photos that show your personality
          </Text>
          <Text style={smallText}>
            • Be authentic in your bio - it helps find better matches
          </Text>
          <Text style={smallText}>
            • Set your preferences to find people you'll truly connect with
          </Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            If you have any questions or need help getting started, we're here for you!
          </Text>

          <Text style={signature}>
            Happy matching! 💕
            <br />
            <strong>The Blossom Team</strong>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            You're receiving this email because you signed up for Blossom.
          </Text>
          <Text style={footerText}>
            © 2025 Blossom. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
};

const headerText = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  borderRadius: '0 0 12px 12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  lineHeight: '1.3',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#fef3f6',
  border: '2px solid #FF6B9D',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const highlightText = {
  color: '#C06C84',
  fontSize: '18px',
  margin: '0 0 12px',
};

const listItem = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
  paddingLeft: '4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#FF6B9D',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '6px 0',
};

const signature = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
  marginTop: '20px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '4px 0',
};
