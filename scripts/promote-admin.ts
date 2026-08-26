import "dotenv/config";

import { promoteVerifiedUserToAdmin } from "@/functions/admin/promote-verified-user-to-admin";
import { createDatabaseScriptClient } from "@/functions/scripts/create-database-script-client";
import { getAdminEmailArgument } from "@/functions/scripts/get-admin-email-argument";
import { getScriptDryRun } from "@/functions/scripts/get-script-dry-run";

async function main() {
  const args = process.argv.slice(2);
  const email = getAdminEmailArgument(args);
  const dryRun = getScriptDryRun(args);
  const { pool, prisma } = createDatabaseScriptClient();

  try {
    const result = await promoteVerifiedUserToAdmin(prisma, email, !dryRun);

    if (result === "alreadyAdmin") {
      console.log(`${email} è già amministratore. Nessuna modifica.`);
    } else if (result === "wouldPromote") {
      console.log(
        `[dry-run] ${email} è verificato e verrebbe promosso ad amministratore.`
      );
    } else {
      console.log(`${email} promosso ad amministratore.`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Promozione amministratore interrotta:", error);
  process.exitCode = 1;
});
