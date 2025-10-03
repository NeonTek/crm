import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectTimeline } from "@/components/project-timeline";
import { ArrowLeft, BarChart2 } from "lucide-react";
import type { Project, Task } from "@/lib/types";

// --- START OF NEW DATA FETCHING LOGIC ---
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { ProjectModel, TaskModel } from "@/lib/models";
import mongoose from "mongoose";

interface ProjectDetailsData {
  project: Project;
  tasks: Task[];
}

async function getProjectDataForClient(
  projectId: string
): Promise<ProjectDetailsData | null> {
  try {
    const session = await getIronSession<SessionData>(
      cookies(),
      sessionOptions
    );
    const clientId = session.clientId;

    if (!clientId) return null; // Not logged in
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null; // Invalid ID format

    await connectDB();

    // Find the project and ensure it belongs to the logged-in client
    const project = await ProjectModel.findOne({
      _id: projectId,
      clientId: clientId,
    }).lean();

    if (!project) return null; // Project not found or access denied

    const tasks = await TaskModel.find({ projectId: projectId })
      .sort({ startDate: "asc" })
      .lean();

    // Convert BSON types to JSON-serializable types
    const serializableProject = JSON.parse(JSON.stringify(project));
    serializableProject.id = serializableProject._id;

    const serializableTasks = JSON.parse(JSON.stringify(tasks)).map(
      (task: any) => ({
        ...task,
        id: task._id,
      })
    );

    return { project: serializableProject, tasks: serializableTasks };
  } catch (error) {
    console.error("Failed to fetch project data for timeline:", error);
    return null;
  }
}
// --- END OF NEW DATA FETCHING LOGIC ---

export default async function ProjectTimelinePage({
  params,
}: {
  params: { id: string };
}) {
  // Call the new direct data-fetching function
  const data = await getProjectDataForClient(params.id);

  if (!data || !data.project || !data.tasks) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/portal/projects/${params.id}`}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Project Details
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Project Timeline: {data.project.name}
          </CardTitle>
          <CardDescription>
            A visual overview of your project's schedule and task durations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectTimeline tasks={data.tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
