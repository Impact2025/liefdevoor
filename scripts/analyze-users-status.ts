import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  console.log("=== GEBRUIKERS ANALYSE ===\n");

  // Totaal gebruikers
  const total = await p.user.count();
  console.log(`Totaal gebruikers: ${total}\n`);

  // Per verificatie status
  const verified = await p.user.count({ where: { isVerified: true } });
  const profileComplete = await p.user.count({
    where: { profileComplete: true },
  });

  console.log("📋 PROFIEL STATUS:");
  console.log(`   Geverifieerd:      ${verified}`);
  console.log(`   Profiel compleet:  ${profileComplete}`);
  console.log(`   Niet compleet:     ${total - profileComplete}\n`);

  // Premium status (subscriptionTier: FREE, BASIC, PREMIUM, VIP)
  const tierStats = await p.user.groupBy({
    by: ["subscriptionTier"],
    _count: true,
  });

  console.log("💎 ABONNEMENT STATUS:");
  for (const tier of tierStats) {
    console.log(`   ${tier.subscriptionTier.padEnd(10)} ${tier._count}`);
  }
  console.log("");

  // Verificatie status
  const photoVerified = await p.user.count({ where: { isPhotoVerified: true } });
  const livenessVerified = await p.user.count({ where: { isLivenessVerified: true } });

  console.log("✅ VERIFICATIE:");
  console.log(`   Foto geverifieerd:     ${photoVerified}`);
  console.log(`   Liveness geverifieerd: ${livenessVerified}\n`);

  // Registratie over tijd
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const registeredToday = await p.user.count({
    where: { createdAt: { gte: today } },
  });
  const registeredWeek = await p.user.count({
    where: { createdAt: { gte: weekAgo } },
  });
  const registeredMonth = await p.user.count({
    where: { createdAt: { gte: monthAgo } },
  });

  console.log("📅 REGISTRATIES:");
  console.log(`   Vandaag:           ${registeredToday}`);
  console.log(`   Afgelopen week:    ${registeredWeek}`);
  console.log(`   Afgelopen maand:   ${registeredMonth}\n`);

  // Geslacht verdeling
  const genderStats = await p.user.groupBy({
    by: ["gender"],
    _count: true,
    where: { profileComplete: true },
  });

  console.log("👥 GESLACHT (complete profielen):");
  for (const g of genderStats) {
    const label = g.gender || "Niet opgegeven";
    console.log(`   ${label.padEnd(18)} ${g._count}`);
  }
  console.log("");

  // Swipes (likes & dislikes)
  const totalSwipes = await p.swipe.count();
  const totalLikes = await p.swipe.count({ where: { isLike: true } });
  const superLikes = await p.swipe.count({ where: { isSuperLike: true } });
  const totalMatches = await p.match.count();

  console.log("❤️ INTERACTIES:");
  console.log(`   Totaal swipes:     ${totalSwipes}`);
  console.log(`   Likes:             ${totalLikes}`);
  console.log(`   Dislikes:          ${totalSwipes - totalLikes}`);
  console.log(`   Super likes:       ${superLikes}`);
  console.log(`   Matches:           ${totalMatches}\n`);

  // Recente activiteit
  const recentlyActive = await p.user.count({
    where: { lastSeen: { gte: weekAgo } },
  });

  console.log("🟢 ACTIVITEIT:");
  console.log(`   Actief afgelopen week: ${recentlyActive}\n`);

  // Registratie bron
  const sourceStats = await p.user.groupBy({
    by: ["registrationSource"],
    _count: true,
  });

  console.log("📱 REGISTRATIE BRON:");
  for (const src of sourceStats) {
    const label = src.registrationSource || "Onbekend";
    console.log(`   ${label.padEnd(18)} ${src._count}`);
  }
  console.log("");

  console.log("=== EINDE ANALYSE ===");
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
