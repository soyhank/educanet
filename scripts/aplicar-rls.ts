/**
 * Aplica un archivo SQL de RLS contra la DB usando el cliente pg.
 * Uso: npx tsx scripts/aplicar-rls.ts <ruta-al-sql>
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { Client } from "pg";

async function main() {
  const archivo = process.argv[2];
  if (!archivo) {
    console.error("Uso: npx tsx scripts/aplicar-rls.ts <ruta-al-sql>");
    process.exit(1);
  }
  const sql = readFileSync(archivo, "utf8");
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DIRECT_URL o DATABASE_URL en el entorno");

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    console.log(`Aplicando ${archivo}…`);
    await client.query(sql);
    console.log("✓ RLS aplicado");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("✗ Error:", e.message);
  process.exit(1);
});
