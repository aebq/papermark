import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
  return new NextResponse(null, { status: 404 });
}
