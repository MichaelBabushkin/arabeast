import postgres from "postgres";

const cs = process.env.DATABASE_URL;
if (!cs) { console.error("No DATABASE_URL"); process.exit(1); }

const sql = postgres(cs, { prepare: false, ssl: cs.includes("localhost") ? false : "require" });

try {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "vocab" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "arabic" text NOT NULL,
      "translit" text DEFAULT '' NOT NULL,
      "meaning" text DEFAULT '' NOT NULL,
      "lang" text DEFAULT 'en' NOT NULL,
      "source" text DEFAULT 'manual' NOT NULL,
      "starred" integer DEFAULT 0 NOT NULL,
      "level" integer DEFAULT 0 NOT NULL,
      "reps" integer DEFAULT 0 NOT NULL,
      "lapses" integer DEFAULT 0 NOT NULL,
      "seen_count" integer DEFAULT 1 NOT NULL,
      "first_seen" timestamp DEFAULT now() NOT NULL,
      "last_seen" timestamp DEFAULT now() NOT NULL,
      "due" timestamp DEFAULT now() NOT NULL,
      "last_reviewed" timestamp,
      CONSTRAINT "vocab_user_word" UNIQUE("user_id","arabic")
    );
  `);
  const cols = await sql`
    select column_name, data_type from information_schema.columns
    where table_name = 'vocab' order by ordinal_position`;
  console.log(`✅ vocab table ready — ${cols.length} columns`);
  for (const c of cols) console.log(`   - ${c.column_name} (${c.data_type})`);
} catch (e) {
  console.error("❌", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
