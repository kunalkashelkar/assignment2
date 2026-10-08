import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { EmailEventType } from "@prisma/client";
import * as React from "react";
import { TransactionCreatedEmail } from "@/emails/TransactionCreatedEmail";
import { AccountConfirmationEmail } from "@/emails/AccountConfirmationEmail";
import { SecurityAlertEmail } from "@/emails/SecurityAlertEmail";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

// Safe lazy instantiation
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode: "dispatched" | "simulated";
}

/**
 * Reusable email dispatch service with lifecycle event tracking
 */
export async function sendEmail({
  to,
  subject,
  react,
  userId,
  metadata = {},
}: SendEmailOptions): Promise<SendEmailResult> {
  // Safe local development mode when API key is missing or blank
  if (!resend || !RESEND_API_KEY || RESEND_API_KEY.includes("placeholder")) {
    const simulatedId = `sim_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[Email Service: Simulated] To: ${to} | Subject: "${subject}" (Simulated ID: ${simulatedId})`);

    // Record initial simulated QUEUED/SENT event in database
    await prisma.emailEvent.create({
      data: {
        userId: userId || null,
        emailId: simulatedId,
        eventType: EmailEventType.SENT,
        recipient: to,
        subject,
        metadata: {
          simulated: true,
          mode: "local_dev",
          ...metadata,
        },
      },
    });

    return {
      success: true,
      messageId: simulatedId,
      mode: "simulated",
    };
  }

  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    });

    if (response.error) {
      console.error("[Email Service Error]:", response.error);

      // Record failed event
      await prisma.emailEvent.create({
        data: {
          userId: userId || null,
          eventType: EmailEventType.FAILED,
          recipient: to,
          subject,
          metadata: {
            error: response.error.message,
            ...metadata,
          },
        },
      });

      return {
        success: false,
        error: response.error.message,
        mode: "dispatched",
      };
    }

    const messageId = response.data?.id;

    // Record initial SENT event in database
    await prisma.emailEvent.create({
      data: {
        userId: userId || null,
        emailId: messageId,
        eventType: EmailEventType.SENT,
        recipient: to,
        subject,
        metadata: {
          resendId: messageId,
          ...metadata,
        },
      },
    });

    return {
      success: true,
      messageId,
      mode: "dispatched",
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unexpected email dispatch failure";
    console.error("[Email Service Exception]:", errMsg);

    await prisma.emailEvent.create({
      data: {
        userId: userId || null,
        eventType: EmailEventType.FAILED,
        recipient: to,
        subject,
        metadata: {
          exception: errMsg,
          ...metadata,
        },
      },
    });

    return {
      success: false,
      error: errMsg,
      mode: "dispatched",
    };
  }
}

/**
 * Convenience helper to dispatch Transaction Created notification
 */
export async function sendTransactionNotification({
  to,
  userName,
  reference,
  amount,
  currency,
  organizationName,
  userId,
}: {
  to: string;
  userName?: string;
  reference: string;
  amount: number | string;
  currency?: string;
  organizationName?: string;
  userId?: string;
}) {
  return await sendEmail({
    to,
    userId,
    subject: `Receipt: Transaction Confirmed [${reference}]`,
    react: React.createElement(TransactionCreatedEmail, {
      userName,
      transactionReference: reference,
      amount,
      currency,
      organizationName,
    }),
    metadata: {
      type: "transaction_receipt",
      reference,
      amount,
    },
  });
}

/**
 * Convenience helper to dispatch Account Confirmation email
 */
export async function sendAccountConfirmation({
  to,
  userName,
  confirmationUrl,
  userId,
}: {
  to: string;
  userName?: string;
  confirmationUrl?: string;
  userId?: string;
}) {
  return await sendEmail({
    to,
    userId,
    subject: "Confirm your Assignment 2 Account",
    react: React.createElement(AccountConfirmationEmail, {
      userName,
      confirmationUrl,
    }),
    metadata: {
      type: "account_confirmation",
    },
  });
}

/**
 * Convenience helper to dispatch Security Alert email
 */
export async function sendSecurityAlert({
  to,
  userName,
  alertType,
  details,
  userId,
  ipAddress,
}: {
  to: string;
  userName?: string;
  alertType?: string;
  details?: string;
  userId?: string;
  ipAddress?: string;
}) {
  return await sendEmail({
    to,
    userId,
    subject: `Security Alert: ${alertType || "Notice"}`,
    react: React.createElement(SecurityAlertEmail, {
      userName,
      alertType,
      details,
      ipAddress,
    }),
    metadata: {
      type: "security_alert",
      alertType,
    },
  });
}
