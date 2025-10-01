import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";

// POST a new reply to a ticket
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  await connectDB();
  const ticket = await TicketModel.findOneAndUpdate(
    { _id: params.id, clientId: session.clientId },
    {
      $push: { messages: { sender: "client", content: message } },
      $set: { status: "open" }, // Re-open ticket on client reply
    },
    { new: true }
  );

  if (!ticket) {
    return NextResponse.json(
      { error: "Ticket not found or access denied" },
      { status: 404 }
    );
  }

  // You can add an email notification to the admin here

  return NextResponse.json(ticket);
}
