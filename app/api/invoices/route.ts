import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { InvoiceModel } from "@/lib/models";

// GET all invoices (for admin)
export async function GET() {
  await connectDB();
  const invoices = await InvoiceModel.find({}).sort({ issueDate: -1 });
  return NextResponse.json(invoices);
}

// POST a new invoice (for admin)
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newInvoice = await InvoiceModel.create(body);
  return NextResponse.json(newInvoice, { status: 201 });
}
