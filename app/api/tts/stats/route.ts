import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { ttsLog } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        totalCalls:    sql<number>`count(*)::int`,
        apiCalls:      sql<number>`coalesce(sum(case when cached = 0 then 1 else 0 end), 0)::int`,
        cacheHits:     sql<number>`coalesce(sum(case when cached = 1 then 1 else 0 end), 0)::int`,
        totalChars:    sql<number>`coalesce(sum(case when cached = 0 then chars else 0 end), 0)::int`,
        todayCalls:    sql<number>`coalesce(sum(case when created_at >= now() - interval '24 hours' then 1 else 0 end), 0)::int`,
        todayApiCalls: sql<number>`coalesce(sum(case when cached = 0 and created_at >= now() - interval '24 hours' then 1 else 0 end), 0)::int`,
        todayChars:    sql<number>`coalesce(sum(case when cached = 0 and created_at >= now() - interval '24 hours' then chars else 0 end), 0)::int`,
      })
      .from(ttsLog);

    return NextResponse.json(rows[0] ?? {});
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
