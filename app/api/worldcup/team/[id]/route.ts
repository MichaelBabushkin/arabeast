import { NextResponse } from "next/server";
import { getTeamSquad } from "@/lib/worldcup";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const squad = await getTeamSquad(id);
    if (!squad) return NextResponse.json({ error: "Squad unavailable" }, { status: 404 });
    return NextResponse.json(squad, { status: 200 });
  } catch (err) {
    console.error("Squad API error:", err);
    return NextResponse.json({ error: "Squad unavailable" }, { status: 500 });
  }
}
