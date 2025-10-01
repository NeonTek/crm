import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TicketModel } from "@/lib/models";

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

// POST a new reply from an admin
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
