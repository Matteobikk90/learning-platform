import type {
  AdminPromotionClient,
  AdminPromotionResult,
} from "@/types/admin";

export async function promoteVerifiedUserToAdmin(
  client: AdminPromotionClient,
  email: string,
  applyChanges: boolean
): Promise<AdminPromotionResult> {
  const user = await client.user.findUnique({
    where: { email },
    select: { emailVerified: true, id: true, role: true },
  });

  if (!user) {
    throw new Error(
      `Utente ${email} non trovato. Deve prima accedere con il magic link.`
    );
  }

  if (!user.emailVerified) {
    throw new Error(
      `Utente ${email} non verificato. Deve completare il magic link.`
    );
  }

  if (user.role === "ADMIN") return "alreadyAdmin";
  if (!applyChanges) return "wouldPromote";

  const updated = await client.user.updateMany({
    where: {
      email,
      emailVerified: { not: null },
      id: user.id,
      role: "USER",
    },
    data: { role: "ADMIN" },
  });

  if (updated.count === 1) return "promoted";

  const currentUser = await client.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (currentUser?.role === "ADMIN") return "alreadyAdmin";

  throw new Error(`Lo stato di ${email} è cambiato. Riprova.`);
}
