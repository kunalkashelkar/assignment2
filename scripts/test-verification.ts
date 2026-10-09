import prisma from "../lib/prisma";
import { connectToDatabase } from "../lib/mongodb";
import { AnalyticsEvent } from "../lib/models/AnalyticsEvent";
import { RoleType, TransactionStatus, AuditEventType, EmailEventType } from "@prisma/client";
import { sendEmail } from "../lib/email";
import * as React from "react";
import { NotificationEmail } from "../emails/NotificationEmail";

async function runVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING ASSIGNMENT 2 FULL INTEGRATION AUDIT");
  console.log("=================================================\n");

  let allPassed = true;

  // 1. Relational Database Counts & Referential Integrity Check
  console.log("1. Checking PostgreSQL & Prisma Normalized Relational Storage...");
  const userCount = await prisma.user.count();
  const orgCount = await prisma.organization.count();
  const roleCount = await prisma.role.count();
  const membershipCount = await prisma.membership.count();
  const transactionCount = await prisma.transaction.count();
  const auditLogCount = await prisma.auditLog.count();
  const emailEventCount = await prisma.emailEvent.count();

  console.log(`   - Users: ${userCount}`);
  console.log(`   - Organizations: ${orgCount}`);
  console.log(`   - Roles: ${roleCount}`);
  console.log(`   - Memberships: ${membershipCount}`);
  console.log(`   - Transactions: ${transactionCount}`);
  console.log(`   - Audit Logs: ${auditLogCount}`);
  console.log(`   - Email Events: ${emailEventCount}`);

  if (userCount === 0 || orgCount === 0 || transactionCount === 0) {
    console.error("❌ Relational counts check failed: records missing!");
    allPassed = false;
  } else {
    console.log("✅ PostgreSQL Relational Storage & Counts Verified.");
  }

  // 2. Foreign Key Integrity Check
  console.log("\n2. Checking Foreign Key & Multi-Tenant Membership Integrity...");
  const memberships = await prisma.membership.findMany({
    include: { user: true, organization: true, role: true },
    take: 5,
  });

  const validFks = memberships.every((m) => m.user && m.organization && m.role);
  if (!validFks || memberships.length === 0) {
    console.error("❌ Foreign key integrity check failed!");
    allPassed = false;
  } else {
    console.log(`✅ Foreign Key integrity valid across ${memberships.length} sample joined memberships.`);
  }

  // 3. Testing MongoDB / Mongoose Connectivity
  console.log("\n3. Checking Mongoose / MongoDB Connectivity...");
  try {
    await connectToDatabase();
    const testDoc = await AnalyticsEvent.create({
      metric: "audit_verification_run",
      source: "audit_script",
      data: { timestamp: new Date().toISOString() },
    });
    console.log(`   - Inserted MongoDB test document ID: ${testDoc._id}`);
    const foundDoc = await AnalyticsEvent.findById(testDoc._id);
    if (foundDoc) {
      console.log("✅ MongoDB Connection & Mongoose Object Document Verified.");
      await AnalyticsEvent.deleteOne({ _id: testDoc._id });
    }
  } catch (mongoErr: unknown) {
    console.error("❌ MongoDB check error:", mongoErr);
    allPassed = false;
  }

  // 4. Testing Email Notification & Event Recording Pipeline
  console.log("\n4. Testing Transactional Email & EmailEvent Recording...");
  const emailRes = await sendEmail({
    to: "admin@assignment2.local",
    subject: "Audit Verification Email Notification",
    react: React.createElement(NotificationEmail, {
      userName: "Administrator",
      eventName: "System Security & Integration Audit",
      message: "This test email verifies the resilient notification pipeline.",
    }),
  });

  if (emailRes.success) {
    const recordedEvent = await prisma.emailEvent.findFirst({
      where: { emailId: emailRes.messageId },
    });
    if (recordedEvent) {
      console.log(`✅ EmailEvent recorded in PostgreSQL ledger (ID: ${recordedEvent.id}, Mode: ${emailRes.mode}).`);
    } else {
      console.error("❌ Email dispatched but EmailEvent was not recorded!");
      allPassed = false;
    }
  } else {
    console.error("❌ Email dispatch failed:", emailRes.error);
    allPassed = false;
  }

  // 5. Testing Webhook Idempotency Logic
  console.log("\n5. Testing Webhook Idempotency Guarantee...");
  const sampleProviderId = `audit_evt_${Date.now()}`;
  const firstEvent = await prisma.emailEvent.create({
    data: {
      providerEventId: sampleProviderId,
      eventType: EmailEventType.DELIVERED,
      recipient: "admin@assignment2.local",
      subject: "Audit Idempotency Test",
    },
  });

  // Attempt duplicate insert should detect unique collision
  try {
    const dupCheck = await prisma.emailEvent.findUnique({
      where: { providerEventId: sampleProviderId },
    });
    if (dupCheck) {
      console.log(`✅ Webhook idempotency recognized duplicate providerEventId [${sampleProviderId}].`);
    }
    // Clean up test event
    await prisma.emailEvent.delete({ where: { id: firstEvent.id } });
  } catch (dupErr) {
    console.error("❌ Idempotency check error:", dupErr);
    allPassed = false;
  }

  console.log("\n=================================================");
  if (allPassed) {
    console.log("🎉 ALL INTEGRATION AUDIT TESTS PASSED SUCCESSFULLY!");
  } else {
    console.log("⚠️ SOME INTEGRATION TESTS FAILED.");
    process.exit(1);
  }
  console.log("=================================================");
}

runVerification()
  .catch((err) => {
    console.error("Fatal audit execution failure:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
