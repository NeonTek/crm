"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/lib/types";

interface EditFinancialsFormProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFinancialsForm({
  project,
  isOpen,
  onClose,
  onSuccess,
}: EditFinancialsFormProps) {
  const [budget, setBudget] = useState(project.budget?.toString() || "0");
  const [amountPaid, setAmountPaid] = useState(
    project.amountPaid?.toString() || "0"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: Number(budget),
          amountPaid: Number(amountPaid),
        }),
      });

      if (!res.ok) throw new Error("Failed to update financials");

      toast({
        title: "Success",
        description: "Project financials have been updated.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update financials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Financials for: {project.name}</DialogTitle>
          <DialogDescription>
            Update the budget and amount paid for this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget (KES)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Paid (KES)</Label>
            <Input
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
