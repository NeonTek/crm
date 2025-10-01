import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";
import mongoose from "mongoose";

// GET a single ticket by its ID for the logged-in client
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Ticket ID" }, { status: 400 });
  }

  await connectDB();
  const ticket = await TicketModel.findOne({
    _id: id,
    clientId: session.clientId,
  });

  if (!ticket) {
    return NextResponse.json(
      { error: "Ticket not found or access denied" },
      { status: 404 }
    );
  }

  return NextResponse.json(ticket);
}
