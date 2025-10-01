import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";

// This route should be protected by admin authentication
export async function GET() {
  await connectDB();
  const tickets = await TicketModel.find({}).sort({ updatedAt: -1 });
  return NextResponse.json(tickets);
}
