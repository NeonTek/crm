import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { InvoiceModel, ClientModel, ProjectModel } from "@/lib/models";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Invoice ID" }, { status: 400 });
  }

  await connectDB();

  const invoice = await InvoiceModel.findById(id).lean();
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const [client, project] = await Promise.all([
    ClientModel.findById(invoice.clientId).lean(),
    ProjectModel.findById(invoice.projectId).lean(),
  ]);

  return NextResponse.json({ invoice, client, project });
}
