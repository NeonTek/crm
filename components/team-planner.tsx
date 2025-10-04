"use client";

import React, { useEffect, useRef, useState } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Users } from "lucide-react";

interface PlannerTask {
  id: string;
  title: string;
  status: string;
  assignedTo: string;
  startDate?: string;
  dueDate?: string;
  projectName: string;
}

export const TeamPlanner: React.FC = () => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndRenderGantt = async () => {
      // Basic Gantt configuration
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.readonly = true;
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        {
          unit: "week",
          step: 1,
          format: (date) => `Week #${gantt.date.getWeek(date)}`,
        },
        { unit: "day", step: 1, format: "%d, %D" },
      ];
      gantt.config.columns = [
        { name: "text", label: "Assignee / Task", tree: true, width: "*" },
        { name: "start_date", label: "Start Date", align: "center", width: 90 },
        { name: "duration", label: "Duration", align: "center", width: 70 },
      ];
      gantt.config.layout = {
        css: "gantt_container",
        rows: [
          {
            cols: [
              {
                view: "grid",
                scrollX: "gridScroll",
                scrollable: true,
                scrollY: "scrollVer",
              },
              { resizer: true, width: 1 },
              {
                view: "timeline",
                scrollX: "scrollHor",
                scrollable: true,
                scrollY: "scrollVer",
              },
              { view: "scrollbar", id: "scrollVer" },
            ],
          },
          { view: "scrollbar", id: "scrollHor" },
        ],
      };

      if (ganttContainer.current) {
        gantt.init(ganttContainer.current);
      }

      // Fetch data from our new API
      const res = await fetch("/api/planner");
      const data: PlannerTask[] = await res.json();
      setIsLoading(false);

      // Process data: Group tasks by assignee
      const assignees: { [key: string]: any[] } = {};
      data.forEach((task) => {
        if (!assignees[task.assignedTo]) {
          assignees[task.assignedTo] = [];
        }
        assignees[task.assignedTo].push(task);
      });

      const ganttData = [];
      let parentIdCounter = 0;

      for (const assigneeName in assignees) {
        const parentId = `assignee_${parentIdCounter++}`;
        ganttData.push({
          id: parentId,
          text: assigneeName,
          open: true, // Keep the assignee groups open by default
          type: "project",
        });

        assignees[assigneeName].forEach((task) => {
          if (task.startDate) {
            const startDate = new Date(task.startDate);
            const endDate = task.dueDate
              ? new Date(task.dueDate)
              : new Date(startDate);
            if (endDate <= startDate) {
              endDate.setDate(startDate.getDate() + 1);
            }
            const duration = Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            ganttData.push({
              id: task.id,
              text: `${task.title} (${task.projectName})`,
              start_date: task.startDate,
              duration: duration,
              parent: parentId,
              progress: task.status === "completed" ? 1 : 0,
            });
          }
        });
      }

      gantt.parse({ data: ganttData });
    };

    fetchAndRenderGantt();

    return () => {
      gantt.clearAll();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team & Resource Planner
        </CardTitle>
        <CardDescription>
          A visual timeline of all tasks across all projects, grouped by
          assignee.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading planner data...</p>}
        <div
          ref={ganttContainer}
          style={{ width: "100%", height: "600px" }}
        ></div>
      </CardContent>
    </Card>
  );
};
