import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeMessages() {
  console.log("=== BERICHTEN ANALYSE ===\n");

  // 1. Totaal aantal berichten
  const totalMessages = await prisma.message.count();
  console.log(`📊 TOTAAL AANTAL BERICHTEN: ${totalMessages.toLocaleString()}\n`);

  // 2. Berichten per type
  const textMessages = await prisma.message.count({
    where: { content: { not: null } },
  });
  const audioMessages = await prisma.message.count({
    where: { audioUrl: { not: null } },
  });
  const gifMessages = await prisma.message.count({
    where: { gifUrl: { not: null } },
  });
  const imageMessages = await prisma.message.count({
    where: { imageUrl: { not: null } },
  });
  const videoMessages = await prisma.message.count({
    where: { videoUrl: { not: null } },
  });

  console.log("📱 BERICHTEN PER TYPE:");
  console.log(`   Tekst:  ${textMessages.toLocaleString()}`);
  console.log(`   Audio:  ${audioMessages.toLocaleString()}`);
  console.log(`   GIF:    ${gifMessages.toLocaleString()}`);
  console.log(`   Foto:   ${imageMessages.toLocaleString()}`);
  console.log(`   Video:  ${videoMessages.toLocaleString()}\n`);

  // 3. Berichten tijdsperiodes
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const messagesToday = await prisma.message.count({
    where: { createdAt: { gte: today } },
  });
  const messagesThisWeek = await prisma.message.count({
    where: { createdAt: { gte: weekAgo } },
  });
  const messagesThisMonth = await prisma.message.count({
    where: { createdAt: { gte: monthAgo } },
  });

  console.log("📅 BERICHTEN PER PERIODE:");
  console.log(`   Vandaag:        ${messagesToday.toLocaleString()}`);
  console.log(`   Afgelopen week: ${messagesThisWeek.toLocaleString()}`);
  console.log(
    `   Afgelopen maand: ${messagesThisMonth.toLocaleString()}\n`
  );

  // 4. Matches statistieken
  const totalMatches = await prisma.match.count();
  const matchesWithMessages = await prisma.match.count({
    where: { messages: { some: {} } },
  });

  console.log("💕 MATCHES STATISTIEKEN:");
  console.log(`   Totaal matches:        ${totalMatches.toLocaleString()}`);
  console.log(`   Matches met berichten: ${matchesWithMessages.toLocaleString()}`);
  console.log(
    `   Matches zonder berichten: ${(totalMatches - matchesWithMessages).toLocaleString()}`
  );
  if (matchesWithMessages > 0) {
    console.log(
      `   Gem. berichten per actieve match: ${(totalMessages / matchesWithMessages).toFixed(1)}\n`
    );
  }

  // 5. Verdeling berichten per match
  const messageDistribution = await prisma.$queryRaw<
    { range: string; count: bigint }[]
  >`
    WITH match_counts AS (
      SELECT "matchId", COUNT(*) as msg_count
      FROM "Message"
      GROUP BY "matchId"
    )
    SELECT
      CASE
        WHEN msg_count = 1 THEN '1 bericht'
        WHEN msg_count BETWEEN 2 AND 5 THEN '2-5 berichten'
        WHEN msg_count BETWEEN 6 AND 10 THEN '6-10 berichten'
        WHEN msg_count BETWEEN 11 AND 25 THEN '11-25 berichten'
        WHEN msg_count BETWEEN 26 AND 50 THEN '26-50 berichten'
        WHEN msg_count BETWEEN 51 AND 100 THEN '51-100 berichten'
        ELSE '100+ berichten'
      END as range,
      COUNT(*) as count
    FROM match_counts
    GROUP BY
      CASE
        WHEN msg_count = 1 THEN '1 bericht'
        WHEN msg_count BETWEEN 2 AND 5 THEN '2-5 berichten'
        WHEN msg_count BETWEEN 6 AND 10 THEN '6-10 berichten'
        WHEN msg_count BETWEEN 11 AND 25 THEN '11-25 berichten'
        WHEN msg_count BETWEEN 26 AND 50 THEN '26-50 berichten'
        WHEN msg_count BETWEEN 51 AND 100 THEN '51-100 berichten'
        ELSE '100+ berichten'
      END
    ORDER BY
      CASE range
        WHEN '1 bericht' THEN 1
        WHEN '2-5 berichten' THEN 2
        WHEN '6-10 berichten' THEN 3
        WHEN '11-25 berichten' THEN 4
        WHEN '26-50 berichten' THEN 5
        WHEN '51-100 berichten' THEN 6
        ELSE 7
      END
  `;

  console.log("📊 VERDELING BERICHTEN PER MATCH:");
  for (const row of messageDistribution) {
    const count = Number(row.count);
    const bar = "█".repeat(Math.min(Math.ceil(count / 5), 50));
    console.log(`   ${row.range.padEnd(18)} ${count.toString().padStart(6)} ${bar}`);
  }
  console.log("");

  // 6. Top 10 meest actieve gesprekken
  const topConversations = await prisma.$queryRaw<
    { matchId: string; msg_count: bigint; user1: string; user2: string }[]
  >`
    SELECT
      m.id as "matchId",
      COUNT(msg.id) as msg_count,
      u1.name as user1,
      u2.name as user2
    FROM "Match" m
    JOIN "User" u1 ON m."user1Id" = u1.id
    JOIN "User" u2 ON m."user2Id" = u2.id
    LEFT JOIN "Message" msg ON msg."matchId" = m.id
    GROUP BY m.id, u1.name, u2.name
    ORDER BY msg_count DESC
    LIMIT 10
  `;

  console.log("🔥 TOP 10 MEEST ACTIEVE GESPREKKEN:");
  for (let i = 0; i < topConversations.length; i++) {
    const conv = topConversations[i];
    const name1 = conv.user1 || "Anoniem";
    const name2 = conv.user2 || "Anoniem";
    console.log(
      `   ${(i + 1).toString().padStart(2)}. ${name1} ↔ ${name2}: ${Number(conv.msg_count).toLocaleString()} berichten`
    );
  }
  console.log("");

  // 7. Berichten per dag (laatste 14 dagen)
  const dailyMessages = await prisma.$queryRaw<
    { date: Date; count: bigint }[]
  >`
    SELECT
      DATE("createdAt") as date,
      COUNT(*) as count
    FROM "Message"
    WHERE "createdAt" >= ${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  `;

  console.log("📈 BERICHTEN PER DAG (laatste 14 dagen):");
  for (const day of dailyMessages) {
    const dateStr = new Date(day.date).toLocaleDateString("nl-NL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const count = Number(day.count);
    const bar = "█".repeat(Math.min(Math.ceil(count / 10), 50));
    console.log(`   ${dateStr.padEnd(15)} ${count.toString().padStart(5)} ${bar}`);
  }
  console.log("");

  // 8. Top 10 meest actieve verzenders
  const topSenders = await prisma.$queryRaw<
    { senderId: string; name: string | null; email: string; msg_count: bigint }[]
  >`
    SELECT
      u.id as "senderId",
      u.name,
      u.email,
      COUNT(m.id) as msg_count
    FROM "User" u
    JOIN "Message" m ON m."senderId" = u.id
    GROUP BY u.id, u.name, u.email
    ORDER BY msg_count DESC
    LIMIT 10
  `;

  console.log("👤 TOP 10 MEEST ACTIEVE VERZENDERS:");
  for (let i = 0; i < topSenders.length; i++) {
    const sender = topSenders[i];
    const displayName = sender.name || sender.email.split("@")[0];
    console.log(
      `   ${(i + 1).toString().padStart(2)}. ${displayName.substring(0, 20).padEnd(20)} ${Number(sender.msg_count).toLocaleString()} berichten`
    );
  }
  console.log("");

  // 9. Gelezen vs ongelezen
  const readMessages = await prisma.message.count({
    where: { read: true },
  });
  const unreadMessages = totalMessages - readMessages;
  const readPercentage =
    totalMessages > 0 ? ((readMessages / totalMessages) * 100).toFixed(1) : 0;

  console.log("👁️ LEESSTATISTIEKEN:");
  console.log(`   Gelezen:   ${readMessages.toLocaleString()} (${readPercentage}%)`);
  console.log(`   Ongelezen: ${unreadMessages.toLocaleString()}\n`);

  // 10. Gemiddelde response tijd (voor matches met > 2 berichten)
  const avgResponseTime = await prisma.$queryRaw<
    { avg_minutes: number }[]
  >`
    WITH message_pairs AS (
      SELECT
        m1."matchId",
        m1."senderId" as sender1,
        m2."senderId" as sender2,
        EXTRACT(EPOCH FROM (m2."createdAt" - m1."createdAt")) / 60 as minutes_diff
      FROM "Message" m1
      JOIN "Message" m2 ON m1."matchId" = m2."matchId"
        AND m2."createdAt" > m1."createdAt"
        AND m1."senderId" != m2."senderId"
      WHERE NOT EXISTS (
        SELECT 1 FROM "Message" m3
        WHERE m3."matchId" = m1."matchId"
          AND m3."createdAt" > m1."createdAt"
          AND m3."createdAt" < m2."createdAt"
      )
    )
    SELECT AVG(minutes_diff) as avg_minutes
    FROM message_pairs
    WHERE minutes_diff < 1440  -- Alleen binnen 24 uur
  `;

  if (avgResponseTime[0]?.avg_minutes) {
    const avgMinutes = Math.round(avgResponseTime[0].avg_minutes);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    console.log("⏱️ GEMIDDELDE REACTIETIJD:");
    if (hours > 0) {
      console.log(`   ${hours} uur en ${minutes} minuten\n`);
    } else {
      console.log(`   ${minutes} minuten\n`);
    }
  }

  // 11. Eerste bericht statistieken
  const firstMessages = await prisma.$queryRaw<
    { total: bigint; with_response: bigint }[]
  >`
    WITH first_messages AS (
      SELECT
        "matchId",
        "senderId",
        MIN("createdAt") as first_msg_time
      FROM "Message"
      GROUP BY "matchId", "senderId"
    ),
    first_per_match AS (
      SELECT DISTINCT ON ("matchId")
        "matchId",
        "senderId"
      FROM first_messages
      ORDER BY "matchId", first_msg_time
    )
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN EXISTS (
        SELECT 1 FROM "Message" m
        WHERE m."matchId" = fpm."matchId"
          AND m."senderId" != fpm."senderId"
      ) THEN 1 END) as with_response
    FROM first_per_match fpm
  `;

  if (firstMessages[0]) {
    const total = Number(firstMessages[0].total);
    const withResponse = Number(firstMessages[0].with_response);
    const responseRate = total > 0 ? ((withResponse / total) * 100).toFixed(1) : 0;
    console.log("💬 EERSTE BERICHT STATISTIEKEN:");
    console.log(`   Totaal eerste berichten: ${total.toLocaleString()}`);
    console.log(`   Met reactie:             ${withResponse.toLocaleString()} (${responseRate}%)`);
    console.log(`   Zonder reactie:          ${(total - withResponse).toLocaleString()}\n`);
  }

  console.log("=== EINDE ANALYSE ===");
}

analyzeMessages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
