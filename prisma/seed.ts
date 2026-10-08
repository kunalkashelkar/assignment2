import {
  PrismaClient,
  RoleType,
  TransactionStatus,
  AuditEventType,
  EmailEventType,
} from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Seed parameters (configurable via environment variables)
const NUM_ORGS = parseInt(process.env.SEED_ORGS || "4", 10);
const NUM_USERS = parseInt(process.env.SEED_USERS || "15", 10);
const NUM_TRANSACTIONS = parseInt(process.env.SEED_TRANSACTIONS || "30", 10);
const NUM_AUDIT_LOGS = parseInt(process.env.SEED_AUDIT_LOGS || "25", 10);
const NUM_EMAIL_EVENTS = parseInt(process.env.SEED_EMAIL_EVENTS || "20", 10);

async function main() {
  console.log("🌱 Starting deterministic relational seeding pipeline...");
  faker.seed(20261008);

  // 1. Ensure Roles exist (ADMIN, MEMBER, GUEST)
  console.log("-> Seeding system Roles...");
  const roleTypes: RoleType[] = [
    RoleType.ADMIN,
    RoleType.MEMBER,
    RoleType.GUEST,
  ];

  const roleMap: Record<RoleType, string> = {
    ADMIN: "",
    MEMBER: "",
    GUEST: "",
  };

  for (const rType of roleTypes) {
    const roleRecord = await prisma.role.upsert({
      where: { name: rType },
      update: {},
      create: {
        name: rType,
        description: `Standard system role for ${rType}`,
      },
    });
    roleMap[rType] = roleRecord.id;
  }

  // 2. Seed Organizations (Tenants)
  console.log(`-> Seeding ${NUM_ORGS} Organizations...`);
  const orgIds: string[] = [];
  for (let i = 0; i < NUM_ORGS; i++) {
    const companyName = faker.company.name();
    const slug = `${faker.helpers.slugify(companyName).toLowerCase()}-${faker.string.alphanumeric(4).toLowerCase()}`;
    const org = await prisma.organization.create({
      data: {
        name: companyName,
        slug,
        description: faker.company.catchPhrase(),
      },
    });
    orgIds.push(org.id);
  }

  // 3. Seed Users
  console.log(`-> Seeding ${NUM_USERS} Users...`);
  const userIds: string[] = [];
  const createdEmails = new Set<string>();

  // Ensure deterministic test accounts
  const fixedUsers = [
    { name: "Super Admin", email: "admin@assignment2.local", role: RoleType.ADMIN },
    { name: "Team Member", email: "member@assignment2.local", role: RoleType.MEMBER },
    { name: "Guest User", email: "guest@assignment2.local", role: RoleType.GUEST },
  ];

  for (const fu of fixedUsers) {
    const user = await prisma.user.upsert({
      where: { email: fu.email },
      update: { name: fu.name },
      create: {
        name: fu.name,
        email: fu.email,
        emailVerified: true,
      },
    });
    userIds.push(user.id);
    createdEmails.add(fu.email);

    // Assign fixed user to primary organization
    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgIds[0],
        },
      },
      update: { roleId: roleMap[fu.role] },
      create: {
        userId: user.id,
        organizationId: orgIds[0],
        roleId: roleMap[fu.role],
      },
    });
  }

  // Seed remaining dynamic users
  for (let i = fixedUsers.length; i < NUM_USERS; i++) {
    let email = faker.internet.email().toLowerCase();
    while (createdEmails.has(email)) {
      email = faker.internet.email().toLowerCase();
    }
    createdEmails.add(email);

    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email,
        emailVerified: faker.datatype.boolean(0.8),
        image: faker.image.avatar(),
      },
    });
    userIds.push(user.id);

    // Assign to 1-2 random organizations with random roles
    const assignedOrg = faker.helpers.arrayElement(orgIds);
    const assignedRole = faker.helpers.arrayElement([RoleType.MEMBER, RoleType.GUEST]);
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: assignedOrg,
        roleId: roleMap[assignedRole],
      },
    });
  }

  // 4. Seed Transactions (belonging to User and Organization)
  console.log(`-> Seeding ${NUM_TRANSACTIONS} Transactions...`);
  for (let i = 0; i < NUM_TRANSACTIONS; i++) {
    const orgId = faker.helpers.arrayElement(orgIds);
    const userId = faker.helpers.arrayElement(userIds);
    const statuses = [
      TransactionStatus.PENDING,
      TransactionStatus.COMPLETED,
      TransactionStatus.FAILED,
      TransactionStatus.REFUNDED,
    ];

    await prisma.transaction.create({
      data: {
        organizationId: orgId,
        userId: userId,
        amount: parseFloat(faker.finance.amount({ min: 10, max: 2500, dec: 2 })),
        currency: "USD",
        status: faker.helpers.arrayElement(statuses),
        description: faker.finance.transactionDescription(),
        reference: `TX-${faker.string.alphanumeric(10).toUpperCase()}`,
        metadata: {
          gateway: faker.helpers.arrayElement(["stripe", "resend_checkout", "bank_transfer"]),
          ip: faker.internet.ipv4(),
        },
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
  }

  // 5. Seed Audit Logs
  console.log(`-> Seeding ${NUM_AUDIT_LOGS} Audit Logs...`);
  const auditEvents = [
    AuditEventType.USER_CREATED,
    AuditEventType.USER_LOGGED_IN,
    AuditEventType.ROLE_ASSIGNED,
    AuditEventType.ORGANIZATION_CREATED,
    AuditEventType.TRANSACTION_CREATED,
    AuditEventType.EMAIL_DISPATCHED,
  ];

  for (let i = 0; i < NUM_AUDIT_LOGS; i++) {
    const userId = faker.helpers.maybe(() => faker.helpers.arrayElement(userIds), { probability: 0.85 });
    const eventType = faker.helpers.arrayElement(auditEvents);

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        eventType,
        action: `AUDIT_${eventType.toLowerCase()}`,
        details: {
          browser: faker.internet.userAgent(),
          timestamp: new Date().toISOString(),
          status: "SUCCESS",
        },
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        createdAt: faker.date.recent({ days: 15 }),
      },
    });
  }

  // 6. Seed Email Events
  console.log(`-> Seeding ${NUM_EMAIL_EVENTS} Email Events...`);
  const emailStatuses = [
    EmailEventType.QUEUED,
    EmailEventType.SENT,
    EmailEventType.DELIVERED,
    EmailEventType.OPENED,
    EmailEventType.CLICKED,
  ];

  for (let i = 0; i < NUM_EMAIL_EVENTS; i++) {
    const userId = faker.helpers.maybe(() => faker.helpers.arrayElement(userIds), { probability: 0.7 });
    const emailId = `msg_${faker.string.alphanumeric(16)}`;
    const eventType = faker.helpers.arrayElement(emailStatuses);

    await prisma.emailEvent.create({
      data: {
        userId: userId || null,
        emailId,
        providerEventId: `evt_${faker.string.alphanumeric(20)}`,
        eventType,
        recipient: faker.internet.email().toLowerCase(),
        subject: faker.helpers.arrayElement([
          "Transaction Receipt",
          "Welcome to Assignment 2 Platform",
          "Security Notification",
        ]),
        metadata: {
          provider: "Resend",
          latency_ms: faker.number.int({ min: 120, max: 950 }),
        },
        createdAt: faker.date.recent({ days: 7 }),
      },
    });
  }

  console.log("✅ Database seeding pipeline completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Fatal Error during seed execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
