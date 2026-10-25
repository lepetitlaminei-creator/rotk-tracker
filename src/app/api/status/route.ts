import { NextResponse } from "next/server";
import { getServerStatus } from "@/lib/rotk/api";

export const revalidate = 60;

// Relais pour l'app de bureau et les futurs widgets (évite les soucis de CORS).
export async function GET() {
  try {
    return NextResponse.json(await getServerStatus());
  } catch {
    return NextResponse.json({ error: "rotk.app injoignable" }, { status: 502 });
  }
}
