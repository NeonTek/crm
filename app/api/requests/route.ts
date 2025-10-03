import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ClientRequestModel } from "@/lib/models";

// GET all client requests (for admin)
export async function GET() {
  await connectDB();
  const requests = await ClientRequestModel.find({}).sort({ createdAt: -1 });
  return NextResponse.json(requests);
}
