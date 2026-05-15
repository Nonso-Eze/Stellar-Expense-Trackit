// Seed script — populates the DB with example data for development
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: {
      username: "alice",
      displayName: "Alice Johnson",
      stellarAddress: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3QLBDNLQQ",
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: {
      username: "bob",
      displayName: "Bob Smith",
      stellarAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    },
  });

  const carol = await prisma.user.upsert({
    where: { username: "carol" },
    update: {},
    create: {
      username: "carol",
      displayName: "Carol White",
    },
  });

  const dave = await prisma.user.upsert({
    where: { username: "dave" },
    update: {},
    create: {
      username: "dave",
      displayName: "Dave Brown",
    },
  });

  // Create a group
  const group = await prisma.group.create({
    data: {
      name: "Weekend Trip to Bali",
      description: "Splitting costs for our Bali trip",
      currency: "XLM",
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id },
          { userId: bob.id },
          { userId: carol.id },
          { userId: dave.id },
        ],
      },
    },
  });

  // Create expenses
  const expense1 = await prisma.expense.create({
    data: {
      title: "Hotel (3 nights)",
      amount: 400,
      currency: "XLM",
      groupId: group.id,
      payerId: alice.id,
      shares: {
        create: [
          { userId: alice.id, amount: 100 },
          { userId: bob.id, amount: 100 },
          { userId: carol.id, amount: 100 },
          { userId: dave.id, amount: 100 },
        ],
      },
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      title: "Group dinner",
      amount: 120,
      currency: "XLM",
      groupId: group.id,
      payerId: bob.id,
      shares: {
        create: [
          { userId: alice.id, amount: 30 },
          { userId: bob.id, amount: 30 },
          { userId: carol.id, amount: 30 },
          { userId: dave.id, amount: 30 },
        ],
      },
    },
  });

  // Mark alice's share of expense2 as paid (she paid bob back)
  await prisma.expenseShare.updateMany({
    where: { expenseId: expense2.id, userId: alice.id },
    data: { paid: true },
  });

  // Create a completed payment
  await prisma.payment.create({
    data: {
      amount: 30,
      currency: "XLM",
      status: "COMPLETED",
      stellarTxHash: "abc123def456",
      senderId: alice.id,
      receiverId: bob.id,
      memo: "Dinner split",
      completedAt: new Date(),
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Users: alice, bob, carol, dave`);
  console.log(`   Group: "${group.name}"`);
  console.log(`   Expenses: ${expense1.title}, ${expense2.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
