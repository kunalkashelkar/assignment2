import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
} from "@react-email/components";

interface AccountConfirmationEmailProps {
  userName?: string;
  confirmationUrl?: string;
}

export const AccountConfirmationEmail: React.FC<AccountConfirmationEmailProps> = ({
  userName = "New Member",
  confirmationUrl = "http://localhost:3000/login",
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", margin: 0, padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "32px", color: "#f8fafc" }}>
          <Section>
            <Heading style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 12px", color: "#ffffff" }}>
              Welcome to the Platform
            </Heading>
            <Text style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
              Hello {userName}, thank you for registering with Assignment 2. Please confirm your account to activate multi-tenant workspace capabilities.
            </Text>
            <Button
              href={confirmationUrl}
              style={{
                backgroundColor: "#6366f1",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
                textAlign: "center",
                display: "inline-block",
                padding: "12px 24px",
                margin: "16px 0",
              }}
            >
              Confirm Account
            </Button>
          </Section>

          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />

          <Text style={{ fontSize: "12px", color: "#64748b", textAlign: "center", margin: 0 }}>
            Security Verification • Better Auth Integrated
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AccountConfirmationEmail;
