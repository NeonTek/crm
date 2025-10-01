import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { PaymentModel, ProjectModel } from "@/lib/models";

// GET all payments
export async function GET() {
  await connectDB();
  const payments = await PaymentModel.find({}).sort({ paymentDate: -1 });
  return NextResponse.json(payments);
}

// POST a new payment
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const { projectId, amount } = body;

  // Create the payment
  const newPayment = await PaymentModel.create(body);

  // Update the corresponding project's amountPaid
  await ProjectModel.findByIdAndUpdate(projectId, {
    $inc: { amountPaid: amount },
  });

  return NextResponse.json(newPayment, { status: 201 });
}
