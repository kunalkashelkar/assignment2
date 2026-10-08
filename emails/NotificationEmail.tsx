import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface NotificationEmailProps {
  userName?: string;
  eventName?: string;
  message?: string;
}

export const NotificationEmail: React.FC<NotificationEmailProps> = ({
  userName = "User",
  eventName = "System Notification",
  message = "This is a transactional notification email.",
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "20px 0 48px" }}>
          <Section
            style={{
              backgroundColor: "#ffffff",
              padding: "40px",
              borderRadius: "8px",
            }}
          >
            <Heading style={{ fontSize: "24px", color: "#333333" }}>
              {eventName}
            </Heading>
            <Text style={{ fontSize: "16px", color: "#555555" }}>
              Hello {userName},
            </Text>
            <Text style={{ fontSize: "16px", color: "#555555" }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NotificationEmail;
