import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";

export async function POST() {
  const session = await getClientSession();
  session.destroy();
  return NextResponse.json({ message: "Logged out" });
}
