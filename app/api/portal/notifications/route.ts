import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { NotificationModel } from "@/lib/models";

// GET all notifications for the logged-in client
export async function GET() {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const notifications = await NotificationModel.find({
    clientId: session.clientId,
  }).sort({ createdAt: -1 });

  return NextResponse.json(notifications);
}
