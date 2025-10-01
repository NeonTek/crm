import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";
import { getClientById } from "@/lib/data";

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

  // --- Start of Notification Logic ---
  const client = await getClientById(session.clientId);
  const adminEmail = process.env.EMAIL_USER || "info@neontek.co.ke";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const emailSubject = `New Reply on Ticket: ${ticket.subject}`;
  const htmlContent = `
    <h1>New Reply from ${client?.name}</h1>
    <p><strong>Ticket:</strong> ${ticket.subject}</p>
    <p><strong>Reply:</strong></p>
    <p>${message}</p>
    <a href="${baseUrl}/dashboard/tickets/${ticket.id}">Click here to view the ticket</a>
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
  // --- End of Notification Logic ---

  return NextResponse.json(ticket);
}
