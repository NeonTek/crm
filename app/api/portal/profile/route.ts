import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { getClientById, updateClient } from "@/lib/data";

// GET the logged-in client's profile data
export async function GET() {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = await getClientById(session.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

// PUT (update) the logged-in client's profile data
export async function PUT(req: Request) {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  const updates = {
    name: body.name,
    company: body.company,
    contactPerson: body.contactPerson,
    phone: body.phone,
  };

  const updatedClient = await updateClient(session.clientId, updates);

  if (!updatedClient) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedClient);
}
