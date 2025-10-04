import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TestimonialModel } from "@/lib/models";

// GET all published testimonials
export async function GET() {
  await connectDB();
  try {
    const testimonials = await TestimonialModel.find({ isPublic: true }).sort({
      createdAt: -1,
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching public testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
