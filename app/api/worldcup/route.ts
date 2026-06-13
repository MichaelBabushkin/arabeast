import { NextResponse } from "next/server";
import { getWorldCupData } from "@/lib/worldcup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getWorldCupData();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("World Cup API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "World Cup data unavailable" },
      { status: 500 },
    );
  }
}
