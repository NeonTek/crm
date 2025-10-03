import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TestimonialModel, ProjectModel } from "@/lib/models";
import { getClientById } from "@/lib/data";

export async function POST(req: Request) {
  await connectDB();
  try {
    const { rating, feedback, clientId, projectId } = await req.json();

    if (!rating || !clientId || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch the project to get its name
    const project = await ProjectModel.findById(projectId).lean();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if feedback for this project already exists to prevent duplicates
    const existingFeedback = await TestimonialModel.findOne({
      clientId,
      projectId,
    });
    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback for this project has already been submitted." },
        { status: 409 }
      );
    }

    const newFeedback = await TestimonialModel.create({
      clientId,
      clientName: client.name,
      projectId,
      projectName: project.name,
      rating: Number(rating),
      feedback,
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
