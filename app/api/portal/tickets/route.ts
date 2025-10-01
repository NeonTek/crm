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

  const adminEmail = process.env.EMAIL_USER || "info@neontek.co.ke";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const emailSubject = `New Support Ticket: ${subject}`;
  const htmlContent = `
    <h1>New Support Ticket from ${client.name}</h1>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
    <a href="${baseUrl}/dashboard/tickets/${newTicket.id}">Click here to view and reply to the ticket</a>
  `;

  await fetch(`${baseUrl}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: adminEmail,
      subject: emailSubject,
      htmlContent,
    }),
  });

  return NextResponse.json(newTicket, { status: 201 });
}