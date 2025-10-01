import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";
import { getClientById } from "@/lib/data";

// GET all tickets for the logged-in client
export async function GET() {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const tickets = await TicketModel.find({ clientId: session.clientId }).sort({
    updatedAt: -1,
  });

  return NextResponse.json(tickets);
}

// POST a new ticket
export async function POST(req: Request) {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 }
    );
  }

  const client = await getClientById(session.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  await connectDB();
  const newTicket = await TicketModel.create({
    clientId: session.clientId,
    clientName: client.name,
    subject,
    messages: [{ sender: "client", content: message }],
  });

  // You can add an email notification to the admin here

  return NextResponse.json(newTicket, { status: 201 });
}
