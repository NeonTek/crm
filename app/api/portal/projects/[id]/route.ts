import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongoose";
import { ProjectModel, TaskModel } from "@/lib/models";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getClientSession();
  if (!session.clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
  }

  await connectDB();

  // Find the project and ensure it belongs to the logged-in client
  const project = await ProjectModel.findOne({
    _id: id,
    clientId: session.clientId,
  }).lean();

  if (!project) {
    return NextResponse.json(
      { error: "Project not found or access denied" },
      { status: 404 }
    );
  }

  // Find all tasks associated with this project
  const tasks = await TaskModel.find({ projectId: id })
    .sort({ createdAt: "asc" })
    .lean();

  // Return the project and its tasks
  return NextResponse.json({
    project: {
      ...project,
      id: project._id.toString(),
    },
    tasks: tasks.map((task) => ({
      ...task,
      id: task._id.toString(),
    })),
  });
}
