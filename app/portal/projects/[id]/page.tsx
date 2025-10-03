"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ListTodo,
  Clock,
} from "lucide-react";
import type { Project, Task } from "@/lib/types";

interface ProjectDetailsData {
  project: Project;
  tasks: Task[];
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<ProjectDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await fetch(`/api/portal/projects/${params.id}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Failed to fetch project details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetails();
  }, [params.id]);

  if (isLoading) {
    return <div className="text-center p-8">Loading project details...</div>;
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Project Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The project you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/portal/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const { project, tasks } = data;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const getStatusIcon = (status: Task["status"]) => {
    if (status === "completed")
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === "in-progress")
      return <Clock className="h-5 w-5 text-blue-500" />;
    return <ListTodo className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <Link
        href="/portal/dashboard"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{project.name}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Start Date: {new Date(project.startDate).toLocaleDateString()}
            </span>
            {project.endDate && (
              <span className="text-sm">
                - End Date: {new Date(project.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">Project Progress</Label>
            <div className="flex items-center gap-4 mt-1">
              <Progress value={progress} className="w-full" />
              <span className="font-semibold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {tasks.length} tasks completed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Checklist</CardTitle>
          <CardDescription>
            A complete list of tasks for this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-3 border rounded-lg"
                >
                  <div>{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        task.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high" ? "destructive" : "secondary"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No tasks have been added to this project yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add this Label component at the bottom of the file if it's not globally available
const Label = React.forwardRef<
  React.ElementRef<"label">,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    {...props}
  />
));
Label.displayName = "Label";
