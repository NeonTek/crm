"use client";

import React, { useEffect, useRef } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import type { Task } from "@/lib/types";

interface ProjectTimelineProps {
  tasks: Task[];
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ tasks }) => {
  const ganttContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ganttContainer.current) {
      // Basic configuration for the Gantt chart
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.readonly = true; // Make it view-only for clients
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        { unit: "day", step: 1, format: "%d, %D" },
      ];
      gantt.config.columns = [
        { name: "text", label: "Task Name", tree: true, width: "*" },
        { name: "start_date", label: "Start Date", align: "center", width: 90 },
        { name: "duration", label: "Duration", align: "center", width: 70 },
      ];

      gantt.init(ganttContainer.current);

      // Format the task data for the Gantt chart
      const formattedTasks = tasks.map((task) => {
        const startDate = new Date(task.startDate!);
        const endDate = task.dueDate
          ? new Date(task.dueDate)
          : new Date(startDate);
        // Ensure endDate is at least one day after startDate for calculation
        if (endDate <= startDate) {
          endDate.setDate(startDate.getDate() + 1);
        }
        const duration = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: task.id,
          text: task.title,
          start_date: task.startDate,
          duration: duration,
          progress: task.status === "completed" ? 1 : 0,
        };
      });

      gantt.parse({ data: formattedTasks });
    }

    return () => {
      gantt.clearAll();
    };
  }, [tasks]);

  return (
    <div ref={ganttContainer} style={{ width: "100%", height: "500px" }}></div>
  );
};
