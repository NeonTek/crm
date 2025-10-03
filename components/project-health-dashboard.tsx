"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ProjectHealth {
  id: string;
  name: string;
  healthStatus: "good" | "at-risk" | "needs-attention";
  progress: number;
  overdueTasks: number;
  financialProgress: number;
}

export function ProjectHealthDashboard() {
  const [healthData, setHealthData] = useState<ProjectHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const res = await fetch("/api/projects/health", { cache: "no-store" });
        if (res.ok) {
          setHealthData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch project health", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHealthData();
  }, []);

  const getHealthUI = (status: ProjectHealth["healthStatus"]) => {
    switch (status) {
      case "good":
        return {
          icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
          text: "On Track",
          color: "text-green-500",
        };
      case "at-risk":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          text: "At Risk",
          color: "text-yellow-500",
        };
      case "needs-attention":
        return {
          icon: <HeartPulse className="h-5 w-5 text-red-500" />,
          text: "Needs Attention",
          color: "text-red-500",
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Project Health</CardTitle>
        <CardDescription>
          An automated overview of the status and potential risks for ongoing
          projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Analyzing project health...</p>
        ) : healthData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.map((project) => {
              const ui = getHealthUI(project.healthStatus);
              return (
                <Link href={`/dashboard/projects`} key={project.id}>
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {project.name}
                        </CardTitle>
                        <Badge
                          variant={
                            project.healthStatus === "needs-attention"
                              ? "destructive"
                              : "secondary"
                          }
                          className={ui.color}
                        >
                          {ui.icon}
                          <span className="ml-1">{ui.text}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Task Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Financial Progress</span>
                          <span>{project.financialProgress}% Paid</span>
                        </div>
                        <Progress value={project.financialProgress} />
                      </div>
                      {project.overdueTasks > 0 && (
                        <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {project.overdueTasks} task(s) overdue
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            There are no active projects to monitor right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
