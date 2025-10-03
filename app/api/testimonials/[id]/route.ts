import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TestimonialModel } from "@/lib/models";

// PUT (update) a testimonial's public status
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { isPublic } = await req.json();

  await connectDB();
  const updatedTestimonial = await TestimonialModel.findByIdAndUpdate(
    params.id,
    { $set: { isPublic } },
    { new: true }
  );

  if (!updatedTestimonial) {
    return NextResponse.json(
      { error: "Testimonial not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedTestimonial);
}
