import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ClientRequestModel } from "@/lib/models";

// PUT (update) a request's status
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await req.json();
  if (
    !status ||
    !["new", "under-review", "approved", "declined"].includes(status)
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const updatedRequest = await ClientRequestModel.findByIdAndUpdate(
    params.id,
    { $set: { status } },
    { new: true }
  );

  if (!updatedRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json(updatedRequest);
}
