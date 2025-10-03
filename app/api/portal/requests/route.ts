import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { ClientRequestModel } from "@/lib/models";
import { getClientById } from "@/lib/data";

// GET all requests for the logged-in client
export async function GET() {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const requests = await ClientRequestModel.find({
    clientId: session.clientId,
  }).sort({ createdAt: -1 });
  return NextResponse.json(requests);
}

// POST a new request
export async function POST(req: Request) {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description } = await req.json();
  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const client = await getClientById(session.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  await connectDB();
  const newRequest = await ClientRequestModel.create({
    clientId: session.clientId,
    clientName: client.name,
    title,
    description,
  });

  return NextResponse.json(newRequest, { status: 201 });
}
