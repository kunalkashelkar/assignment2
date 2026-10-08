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
} from "@react-email/components";

interface SecurityAlertEmailProps {
  userName?: string;
  alertType?: string;
  details?: string;
  timestamp?: string;
  ipAddress?: string;
}

export const SecurityAlertEmail: React.FC<SecurityAlertEmailProps> = ({
  userName = "Security Administrator",
  alertType = "Privileged Action Performed",
  details = "A sensitive administrative operation was executed on your tenant account.",
  timestamp = new Date().toISOString(),
  ipAddress = "127.0.0.1",
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", margin: 0, padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #e11d48", padding: "32px", color: "#f8fafc" }}>
          <Section>
            <Text style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#f43f5e", margin: 0 }}>
              SECURITY NOTIFICATION
            </Text>
            <Heading style={{ fontSize: "22px", fontWeight: "bold", margin: "12px 0 8px", color: "#ffffff" }}>
              {alertType}
            </Heading>
            <Text style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.5" }}>
              Hello {userName}, we detected the following security-sensitive action on your workspace.
            </Text>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", borderRadius: "8px", padding: "16px", border: "1px solid #334155", margin: "20px 0" }}>
            <Text style={{ fontSize: "13px", color: "#e2e8f0", margin: "0 0 8px" }}>
              {details}
            </Text>
            <Text style={{ fontSize: "11px", color: "#64748b", margin: 0, fontFamily: "monospace" }}>
              Time: {timestamp} | IP: {ipAddress}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />

          <Text style={{ fontSize: "12px", color: "#64748b", textAlign: "center", margin: 0 }}>
            Audit Log Security Daemon • Assignment 2
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SecurityAlertEmail;
