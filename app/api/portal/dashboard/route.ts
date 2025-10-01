import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { getClientById, getProjectsByClientId, getTasksByProjectId } from "@/lib/data";
import { Project, Task } from "@/lib/types";

export async function GET() {
  try {
    const session = await getClientSession();

    if (!session.isLoggedIn || !session.clientId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await getClientById(session.clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const projects = await getProjectsByClientId(session.clientId);
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await getTasksByProjectId(project.id);
        return { ...project, tasks };
      })
    );

    return NextResponse.json({
      client,
      projects: projectsWithTasks,
    });
  } catch (error) {
    console.error("Error fetching client dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}