import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function check() {
  // Check showcase profielen
  const showcase = await p.user.count({ where: { isShowcase: true } });
  console.log("Showcase profielen:", showcase);

  // Check wie elkaar geliked heeft (potentiële matches)
  const potentialMatches = await p.$queryRaw<{ user1: string; user2: string }[]>`
    SELECT s1."swiperId" as user1, s1."swipedId" as user2
    FROM "Swipe" s1
    JOIN "Swipe" s2 ON s1."swiperId" = s2."swipedId" AND s1."swipedId" = s2."swiperId"
    WHERE s1."isLike" = true AND s2."isLike" = true
    AND s1."swiperId" < s1."swipedId"
  `;

  console.log("Potentiële matches (mutual likes):", potentialMatches.length);

  if (potentialMatches.length > 0) {
    console.log("\nMutual likes gevonden! Deze kunnen matches worden:");
    for (const pm of potentialMatches.slice(0, 5)) {
      const u1 = await p.user.findUnique({
        where: { id: pm.user1 },
        select: { name: true },
      });
      const u2 = await p.user.findUnique({
        where: { id: pm.user2 },
        select: { name: true },
      });
      console.log(`  - ${u1?.name || "Anoniem"} <-> ${u2?.name || "Anoniem"}`);
    }
  }

  // Check users met complete profielen
  const complete = await p.user.findMany({
    where: { profileComplete: true },
    select: { id: true, name: true, gender: true, city: true },
    take: 10,
  });

  console.log("\nVoorbeeld complete profielen:");
  complete.forEach((u) =>
    console.log(
      `  - ${u.name || "Anoniem"} (${u.gender || "?"}) - ${u.city || "Geen stad"}`
    )
  );

  // Check wie recent geliked is maar niet terug
  const pendingLikes = await p.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "Swipe" s1
    WHERE s1."isLike" = true
    AND NOT EXISTS (
      SELECT 1 FROM "Swipe" s2
      WHERE s2."swiperId" = s1."swipedId"
      AND s2."swipedId" = s1."swiperId"
    )
  `;
  console.log(
    "\nLikes die nog niet beantwoord zijn:",
    Number(pendingLikes[0]?.count || 0)
  );

  await p.$disconnect();
}

check().catch(console.error);
