// Runs every .sql file in db/migrations/ in filename order against DATABASE_URL.
//
// Local / CI use only. DATABASE_URL is a server-only secret and is never
// bundled into the deployed app — production data access goes through the
// Neon Data API, protected by the RLS policies these migrations create.
//
//   npm run db:migrate

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "dotenv/config";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "db", "migrations");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error(`No .sql files found in ${migrationsDir}`);
  process.exit(1);
}

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  for (const file of files) {
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    process.stdout.write(`Running ${file} ... `);
    await client.query(sql);
    console.log("done");
  }
  console.log(`\nApplied ${files.length} migration file(s).`);
} catch (err) {
  console.error("\nMigration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
