import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding script...");

  // Example seed demonstration using Faker
  const sampleUsers = Array.from({ length: 5 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    role: "user",
  }));

  console.log(`Generated ${sampleUsers.length} sample mock records.`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
