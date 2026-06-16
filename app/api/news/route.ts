import { NextResponse } from "next/server";
import { getNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getNews();
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("News API error:", err);
    return NextResponse.json({ error: "News unavailable" }, { status: 500 });
  }
}
