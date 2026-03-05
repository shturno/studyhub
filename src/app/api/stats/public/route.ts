import { NextResponse } from "next/server";
import { getPublicStats } from "./getPublicStats";

export const revalidate = 3600;

export async function GET() {
  const stats = await getPublicStats();
  return NextResponse.json(stats);
}
