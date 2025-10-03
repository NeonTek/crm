import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TestimonialModel } from "@/lib/models";

// POST a new testimonial or update an existing feedback entry
export async function POST(req: Request) {
  await connectDB();
  try {
    const { feedbackId, testimonial } = await req.json();

    if (!feedbackId || !testimonial) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedTestimonial = await TestimonialModel.findByIdAndUpdate(
      feedbackId,
      { $set: { testimonial } },
      { new: true }
    );

    if (!updatedTestimonial) {
      return NextResponse.json(
        { error: "Feedback entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}

// GET all testimonials (for admin)
export async function GET() {
  await connectDB();
  const testimonials = await TestimonialModel.find({
    testimonial: { $exists: true, $ne: "" },
  }).sort({ createdAt: -1 });
  return NextResponse.json(testimonials);
}
