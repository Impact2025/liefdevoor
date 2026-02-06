import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const users = await p.user.count();
  const matches = await p.match.count();
  const msgs = await p.message.count();

  console.log("Database inhoud:");
  console.log("- Gebruikers:", users);
  console.log("- Matches:", matches);
  console.log("- Berichten:", msgs);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
