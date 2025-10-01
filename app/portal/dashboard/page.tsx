"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import type { Client, Project, Task } from "@/lib/types";
import {
  Building2,
  FolderOpen,
  CheckSquare,
  LogOut,
  FileText,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

interface ProjectWithTasks extends Project {
  tasks: Task[];
}

interface DashboardData {
  client: Client;
  projects: ProjectWithTasks[];
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/portal/dashboard");
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        } else {
          router.push("/portal/login");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        router.push("/portal/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <p>Could not load dashboard data.</p>
      </div>
    );
  }

  const { client, projects } = data;

  const getStatusColor = (status: Project["status"] | Task["status"]) => {
    switch (status) {
      case "planning":
      case "todo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "on-hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Client Portal</h1>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="p-4 sm:px-6 sm:py-4 md:gap-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome, {client.name}!</CardTitle>
            <CardDescription>
              Here is an overview of your projects and services with NeonTek.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your Client ID is: <strong>{client.id}</strong>
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <FolderOpen className="h-6 w-6 text-primary" />
              Your Projects
            </h2>
            {projects.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {projects.map((project) => (
                  <AccordionItem value={project.id} key={project.id}>
                    <AccordionTrigger>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full pr-4">
                        <span className="font-semibold text-lg text-left">
                          {project.name}
                        </span>
                        <Badge
                          className={`${getStatusColor(
                            project.status
                          )} mt-2 md:mt-0`}
                        >
                          {project.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-background rounded-b-md">
                      <p className="text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <strong>Start Date:</strong>{" "}
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        {project.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <strong>End Date:</strong>{" "}
                              {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {project.budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <strong>Budget:</strong> KES{" "}
                              {project.budget.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-primary" />
                        Tasks
                      </h4>
                      {project.tasks.length > 0 ? (
                        <ul className="space-y-2">
                          {project.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="flex items-start justify-between p-2 rounded-md border"
                            >
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {task.description}
                                </p>
                              </div>
                              <Badge
                                className={`${getStatusColor(
                                  task.status
                                )} ml-4`}
                              >
                                {task.status.replace("-", " ")}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tasks for this project yet.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    You don't have any projects with us yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
