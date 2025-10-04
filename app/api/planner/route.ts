import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TaskModel, ProjectModel, ClientModel } from "@/lib/models";
import { Types } from "mongoose";

// Define a type for the lean project object to satisfy TypeScript
interface LeanDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

export async function GET() {
  await connectDB();
  try {
    // Fetch all data in parallel
    const [tasks, projects, clients] = await Promise.all([
      TaskModel.find({}).lean() as Promise<LeanDocument[]>,
      ProjectModel.find({}).lean() as Promise<LeanDocument[]>,
      ClientModel.find({}).lean() as Promise<LeanDocument[]>,
    ]);

    // Create maps for quick lookups to improve performance
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));
    const clientMap = new Map(clients.map((c) => [c._id.toString(), c]));

    const plannerData = tasks.map((task) => {
      const project = projectMap.get(task.projectId.toString());
      const client = project
        ? clientMap.get(project.clientId.toString())
        : undefined;

      return {
        id: task._id.toString(),
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || "Unassigned",
        startDate: task.startDate,
        dueDate: task.dueDate,
        projectName: project?.name || "N/A",
        clientName: client?.name || "N/A",
      };
    });

    return NextResponse.json(plannerData);
  } catch (error) {
    console.error("Error fetching planner data:", error);
    return NextResponse.json(
      { error: "Failed to fetch planner data" },
      { status: 500 }
    );
  }
}
