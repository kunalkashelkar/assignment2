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

interface TransactionCreatedEmailProps {
  userName?: string;
  transactionReference: string;
  amount: number | string;
  currency?: string;
  organizationName?: string;
  date?: string;
}

export const TransactionCreatedEmail: React.FC<TransactionCreatedEmailProps> = ({
  userName = "Valued Customer",
  transactionReference,
  amount,
  currency = "USD",
  organizationName = "Assignment 2 Enterprise",
  date = new Date().toLocaleDateString(),
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", margin: 0, padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "32px", color: "#f8fafc" }}>
          <Section>
            <Text style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#38bdf8", margin: 0 }}>
              {organizationName}
            </Text>
            <Heading style={{ fontSize: "24px", fontWeight: "bold", margin: "16px 0 8px", color: "#ffffff" }}>
              Transaction Confirmed
            </Heading>
            <Text style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.5" }}>
              Hello {userName}, your transaction has been successfully processed into our relational ledger.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />

          <Section style={{ backgroundColor: "#0f172a", borderRadius: "8px", padding: "16px", border: "1px solid #1e293b" }}>
            <Text style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px" }}>REFERENCE NUMBER</Text>
            <Text style={{ fontSize: "16px", fontFamily: "monospace", color: "#e2e8f0", margin: "0 0 12px" }}>
              {transactionReference}
            </Text>

            <Text style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px" }}>AMOUNT CHARGED</Text>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#34d399", margin: "0 0 12px" }}>
              ${typeof amount === "number" ? amount.toFixed(2) : amount} {currency}
            </Text>

            <Text style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px" }}>DATE</Text>
            <Text style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>{date}</Text>
          </Section>

          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />

          <Text style={{ fontSize: "12px", color: "#64748b", textAlign: "center", margin: 0 }}>
            Automated Relational Event Notification • Assignment 2
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TransactionCreatedEmail;
