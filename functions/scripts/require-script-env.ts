export function requireScriptEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    console.error(`Variabile d'ambiente mancante: ${name}`);
    process.exit(1);
  }

  return value;
}
