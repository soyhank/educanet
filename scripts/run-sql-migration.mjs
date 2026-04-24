/**
 * Runs a SQL migration directly against Supabase using DIRECT_URL from .env.local.
 * Usage: node scripts/run-sql-migration.mjs <migration-file>
 */
import { readFileSync } from "fs";
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let val = trimmed.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
}

const directUrl = env.DIRECT_URL;
if (!directUrl) {
  console.error("❌  DIRECT_URL not found in .env.local");
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/run-sql-migration.mjs <sql-file>");
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), sqlFile), "utf-8");

const { Client } = require("pg");
const client = new Client({ connectionString: directUrl });

console.log(`\n🔗  Connecting via DIRECT_URL...`);
await client.connect();
console.log(`✅  Connected\n`);

console.log(`📄  Running: ${sqlFile}\n`);
console.log("─".repeat(60));

try {
  const result = await client.query(sql);
  const results = Array.isArray(result) ? result : [result];
  for (const r of results) {
    if (r.command === "SELECT" && r.rows?.length > 0) {
      console.table(r.rows);
    } else if (r.rowCount != null) {
      console.log(`${r.command}: ${r.rowCount} row(s) affected`);
    }
  }
  console.log("─".repeat(60));
  console.log("\n✅  Migration completed successfully\n");
} catch (err) {
  console.error("\n❌  Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
