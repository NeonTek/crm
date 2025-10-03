import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ProjectModel, TaskModel } from "@/lib/models";
import type { Project, Task } from "@/lib/types";

// Helper function to calculate task progress for a project
const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completedTasks / tasks.length) * 100);
};

// Helper function to check for overdue tasks
const countOverdueTasks = (tasks: Task[]): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < today
  ).length;
};

export async function GET() {
  await connectDB();
  try {
    const rawProjects = await ProjectModel.find({}).lean();
    const rawTasks = await TaskModel.find({}).lean();

    const allProjects: Project[] = rawProjects.map((project: any) => ({
      ...project,
      id: project._id.toString(),
    }));

    const allTasks: Task[] = rawTasks.map((task: any) => ({
      ...task,
      id: task._id.toString(),
    }));

    const activeProjects = allProjects.filter(
      (p) => p.status === "in-progress"
    );

    const healthData = activeProjects.map((project) => {
      const projectTasks = allTasks.filter(
        (task) => task.projectId.toString() === project.id.toString()
      );

      const progress = calculateProgress(projectTasks);
      const overdueTasks = countOverdueTasks(projectTasks);

      const budget = project.budget || 0;
      const amountPaid = project.amountPaid || 0;
      const financialProgress =
        budget > 0 ? Math.round((amountPaid / budget) * 100) : 0;

      let healthStatus: "good" | "at-risk" | "needs-attention" = "good";
      if (
        overdueTasks > 0 ||
        (progress > 50 && financialProgress < progress / 2)
      ) {
        healthStatus = "needs-attention";
      } else if (progress < financialProgress - 30) {
        healthStatus = "at-risk";
      }

      return {
        id: project.id.toString(),
        name: project.name,
        healthStatus,
        progress,
        overdueTasks,
        financialProgress,
      };
    });

    return NextResponse.json(healthData);
  } catch (error) {
    console.error("Error fetching project health:", error);
    return NextResponse.json(
      { error: "Failed to fetch project health data" },
      { status: 500 }
    );
  }
}
