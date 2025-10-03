import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { InvoiceModel } from "@/lib/models";

// GET all invoices for the logged-in client
export async function GET() {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const invoices = await InvoiceModel.find({ clientId: session.clientId }).sort(
    { issueDate: -1 }
  );

  return NextResponse.json(invoices);
}
