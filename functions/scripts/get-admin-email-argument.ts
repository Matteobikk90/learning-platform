import { z } from "zod";

import { SCRIPT_FLAGS } from "@/constants/scripts";

const emailSchema = z.string().trim().toLowerCase().email();
const emailPrefix = "--email=";

export function getAdminEmailArgument(args: readonly string[]) {
  const emailArguments = args.filter((argument) =>
    argument.startsWith(emailPrefix)
  );
  const unknownArguments = args.filter(
    (argument) =>
      argument !== SCRIPT_FLAGS.apply &&
      argument !== SCRIPT_FLAGS.dryRun &&
      !argument.startsWith(emailPrefix)
  );

  if (emailArguments.length !== 1 || unknownArguments.length > 0) {
    throw new Error("Uso: pnpm admin:promote --email=nome@dominio.it");
  }

  const parsed = emailSchema.safeParse(
    emailArguments[0]?.slice(emailPrefix.length)
  );

  if (!parsed.success) {
    throw new Error("Indirizzo email non valido.");
  }

  return parsed.data;
}
