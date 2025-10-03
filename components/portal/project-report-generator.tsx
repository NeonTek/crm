"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Project, Task, Client } from "@/lib/types";

interface ProjectReportGeneratorProps {
  project: Project;
  tasks: Task[];
  client: Client;
}

export function ProjectReportGenerator({
  project,
  tasks,
  client,
}: ProjectReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Project Status Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Project: ${project.name}`, 14, 30);
    doc.text(`Client: ${client.name}`, 14, 36);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

    // Financial Summary
    const budget = project.budget || 0;
    const paid = project.amountPaid || 0;
    const balance = budget - paid;

    autoTable(doc, {
      startY: 50,
      head: [["Financial Overview", "Amount (KES)"]],
      body: [
        ["Total Budget", budget.toLocaleString()],
        ["Amount Paid", paid.toLocaleString()],
        ["Outstanding Balance", balance.toLocaleString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [0, 191, 255] },
    });

    // Task Summary
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
    const todoTasks = tasks.filter((t) => t.status === "todo");

    const taskBody = tasks.map((task) => [
      task.title,
      task.status,
      task.priority,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A",
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["Task", "Status", "Priority", "Due Date"]],
      body: taskBody,
      theme: "grid",
      headStyles: { fillColor: [0, 191, 255] },
    });

    doc.save(`Project_Report_${project.name.replace(/\s/g, "_")}.pdf`);
    setIsGenerating(false);
  };

  return (
    <Button onClick={generateReport} disabled={isGenerating}>
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : "Generate Report"}
    </Button>
  );
}
