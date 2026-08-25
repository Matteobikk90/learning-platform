export type ScriptClientsOptions = {
  requireMuxSigning?: boolean;
};

export type ProductionMigrationCommandResult = {
  error?: Error;
  status: number | null;
};

export type ProductionMigrationCommand = () => ProductionMigrationCommandResult;

export type ProductionMigrationResult = "applied" | "skipped";
