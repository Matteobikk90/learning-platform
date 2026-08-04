import { SCRIPT_FLAGS } from "@/constants/scripts";

export function getScriptDryRun(args: readonly string[]) {
  const applyChanges = args.includes(SCRIPT_FLAGS.apply);
  const requestedDryRun = args.includes(SCRIPT_FLAGS.dryRun);

  if (applyChanges && requestedDryRun) {
    console.error("Usa --apply oppure --dry-run, non entrambi.");
    process.exit(1);
  }

  return !applyChanges;
}
