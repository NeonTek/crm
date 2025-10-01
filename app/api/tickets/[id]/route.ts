import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";
import { getClientById } from "@/lib/data";

// GET a single ticket by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const ticket = await TicketModel.findById(params.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json(ticket);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  await connectDB();
  const ticket = await TicketModel.findByIdAndUpdate(
    params.id,
    {
      $push: { messages: { sender: "staff", content: message } },
      $set: { status: "in-progress" },
    },
    { new: true }
  );

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // --- Start of Notification Logic ---
  const client = await getClientById(ticket.clientId);
  if (client && client.email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const emailSubject = `Update on your ticket: ${ticket.subject}`;
    const htmlContent = `
      <h1>A reply has been added to your support ticket</h1>
      <p><strong>Ticket:</strong> ${ticket.subject}</p>
      <p><strong>Reply from NeonTek Support:</strong></p>
      <p>${message}</p>
      <a href="${baseUrl}/portal/tickets/${ticket.id}">Click here to view your ticket</a>
    `;

    await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: client.email,
        subject: emailSubject,
        htmlContent,
      }),
    });
  }

  return NextResponse.json(ticket);
}
// PATCH to update ticket status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await req.json();
  if (!status || !["open", "in-progress", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const ticket = await TicketModel.findByIdAndUpdate(
    params.id,
    { $set: { status } },
    { new: true }
  );

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json(ticket);
}
