import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: {
      email: "alice@prisma.io",
    },
    update: {},
    create: {
      email: "alice@prisma.io",
      name: "Alice Wonderland",
      rating: 2600,
      image: "/alice.jpg",
    },
  });

  // const game = await prisma.gameInProgress.upsert({
  //   where: {
  //     id: "cl7rummve0008y2us4d98dscd",
  //   },
  //   update: {},
  //   create: {
  //     players: {
  //       connect: [{ id: alice.id }, { id: kyle.id }],
  //     },
  //   },
  // });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
