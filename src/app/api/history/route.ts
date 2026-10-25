import { NextResponse, type NextRequest } from "next/server";
import { getStatusHistory } from "@/lib/rotk/history";

// Historique horaire pour l'app de bureau : /api/history?days=7 (30 max).
export async function GET(req: NextRequest) {
  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days")) || 7, 1), 30);
  return NextResponse.json({ days, samples: await getStatusHistory(days) });
}
