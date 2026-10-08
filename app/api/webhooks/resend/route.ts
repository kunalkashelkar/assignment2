import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { EmailEventType } from "@prisma/client";
import { z } from "zod";

const ResendWebhookPayloadSchema = z.object({
  type: z.string(),
  created_at: z.string().optional(),
  data: z.object({
    id: z.string().optional(), // Provider event ID
    email_id: z.string(), // Resend email ID
    to: z.array(z.string()).optional(),
    recipient: z.string().optional(),
    from: z.string().optional(),
    subject: z.string().optional(),
    created_at: z.string().optional(),
  }),
});

/**
 * Maps Resend event string to Prisma EmailEventType enum
 */
function mapResendEventType(type: string): EmailEventType | null {
  const normalized = type.toLowerCase();
  if (normalized.includes("delivered")) return EmailEventType.DELIVERED;
  if (normalized.includes("bounced")) return EmailEventType.BOUNCED;
  if (normalized.includes("failed")) return EmailEventType.FAILED;
  if (normalized.includes("opened")) return EmailEventType.OPENED;
  if (normalized.includes("clicked")) return EmailEventType.CLICKED;
  if (normalized.includes("sent")) return EmailEventType.SENT;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Signature verification
    if (webhookSecret && !webhookSecret.includes("placeholder")) {
      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json(
          { success: false, error: "Missing required svix signature headers" },
          { status: 401 }
        );
      }

      try {
        const wh = new Webhook(webhookSecret);
        wh.verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (verifyError: unknown) {
        console.error("Resend webhook signature verification failed:", verifyError);
        return NextResponse.json(
          { success: false, error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn("⚠️ [DEV WARNING] RESEND_WEBHOOK_SECRET not configured with a live key. Allowing verified local dev mock payload.");
    }

    // Parse and validate payload
    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const parseResult = ResendWebhookPayloadSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid Resend webhook payload structure", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { type, data } = parseResult.data;
    const mappedType = mapResendEventType(type);

    if (!mappedType) {
      // Return 200 to acknowledge unhandled event types without error
      return NextResponse.json({ success: true, message: `Ignored unhandled event type: ${type}` }, { status: 200 });
    }

    const providerEventId = data.id || svixId || `evt_${data.email_id}_${mappedType}`;
    const emailId = data.email_id;
    const recipient = data.to?.[0] || data.recipient || "unknown@recipient.com";

    // Idempotency check: A duplicate webhook event must not create duplicate records
    const existing = await prisma.emailEvent.findUnique({
      where: { providerEventId },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Event already recorded (idempotent duplicate acknowledged)",
          id: existing.id,
        },
        { status: 200 }
      );
    }

    // Try finding associated user by recipient email
    const matchingUser = await prisma.user.findFirst({
      where: { email: recipient.toLowerCase() },
      select: { id: true },
    });

    // Record verified email event
    const emailEvent = await prisma.emailEvent.create({
      data: {
        userId: matchingUser?.id || null,
        emailId,
        providerEventId,
        eventType: mappedType,
        recipient,
        subject: data.subject || null,
        metadata: {
          rawType: type,
          receivedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email lifecycle event successfully processed",
        id: emailEvent.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unhandled error processing Resend webhook:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
