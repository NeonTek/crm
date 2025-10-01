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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, DollarSign, Edit } from "lucide-react";
import { PaymentForm } from "./payment-form";
import { EditFinancialsForm } from "./edit-financials-form";
import type { Client, Project, Payment } from "@/lib/types";

export function BillingList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, projectsRes, paymentsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/projects"),
        fetch("/api/payments"),
      ]);
      setClients(await clientsRes.json());
      setProjects(await projectsRes.json());
      setPayments(await paymentsRes.json());
    } catch (error) {
      console.error("Failed to fetch billing data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name || "N/A";

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name || "N/A";

  const getPaymentStatus = (project: Project) => {
    const budget = project.budget || 0;
    const paid = project.amountPaid || 0;

    if (budget <= 0) {
      return { text: "No Budget", color: "bg-gray-100 text-gray-800" };
    }
    if (paid >= budget) {
      return { text: "Paid", color: "bg-green-100 text-green-800" };
    }
    if (paid > 0) {
      return { text: "Partially Paid", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Unpaid", color: "bg-red-100 text-red-800" };
  };

  const totalBilled = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalPaid = projects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  const handleSuccess = () => {
    setShowPaymentForm(false);
    setEditingProject(null);
    fetchData(); // This will re-fetch all data and update the UI
  };

  if (showPaymentForm) {
    return (
      <PaymentForm
        onSuccess={handleSuccess}
        onCancel={() => setShowPaymentForm(false)}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Billing & Payments
            </h2>
            <p className="text-muted-foreground">
              Track all client payments and project balances.
            </p>
          </div>
          <Button onClick={() => setShowPaymentForm(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Billed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {totalBilled.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                KES {totalPaid.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                KES {totalOutstanding.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Financials</CardTitle>
            <CardDescription>
              An overview of the financial status for each project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading projects...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Budget (KES)</TableHead>
                    <TableHead className="text-right">
                      Amount Paid (KES)
                    </TableHead>
                    <TableHead className="text-right">Balance (KES)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const budget = project.budget || 0;
                    const paid = project.amountPaid || 0;
                    const balance = budget - paid;
                    const status = getPaymentStatus(project);

                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          {project.name}
                        </TableCell>
                        <TableCell>{getClientName(project.clientId)}</TableCell>
                        <TableCell className="text-right">
                          {budget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          {paid.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${
                            balance > 0 ? "text-red-500" : ""
                          }`}
                        >
                          {balance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={status.color}>{status.text}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Reintegrated Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              A log of all individual payments received from clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading payments...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Amount (KES)</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{getClientName(payment.clientId)}</TableCell>
                      <TableCell>{getProjectName(payment.projectId)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {payment.paymentMethod.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Financials Modal */}
      {editingProject && (
        <EditFinancialsForm
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
