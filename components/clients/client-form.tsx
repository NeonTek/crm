"use client";

import type React from "react";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { IClient } from "@/models/Client";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required").trim(),
  contactPerson: z.string().min(1, "Contact person is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().min(1, "Phone number is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: IClient;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function ClientForm({ client, onSuccess, trigger }: ClientFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: client
      ? {
          name: client.name,
          contactPerson: client.contactPerson,
          email: client.email,
          phone: client.phone,
          address: client.address,
        }
      : {
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
        },
  });

  const onSubmit = async (data: ClientFormData) => {
    console.log("Client form submission:", data);
    setLoading(true);
    try {
      const url = client ? `/api/clients/${client._id}` : "/api/clients";
      const method = client ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save client");
      }

      toast.success(
        client ? "Client updated successfully" : "Client created successfully"
      );
      setOpen(false);
      reset();
      onSuccess();
    } catch (error: any) {
      console.error("Client form error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Add Client
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  id="name"
                  {...field}
                  placeholder="Enter client name"
                  className={errors.name ? "border-destructive" : ""}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => (
                <Input
                  id="contactPerson"
                  {...field}
                  placeholder="Enter contact person name"
                  className={errors.contactPerson ? "border-destructive" : ""}
                />
              )}
            />
            {errors.contactPerson && (
              <p className="text-sm text-destructive">
                {errors.contactPerson.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  {...field}
                  placeholder="Enter email address"
                  className={errors.email ? "border-destructive" : ""}
                />
              )}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  id="phone"
                  {...field}
                  placeholder="Enter phone number"
                  className={errors.phone ? "border-destructive" : ""}
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="address"
                  {...field}
                  placeholder="Enter full address"
                  rows={3}
                  className={errors.address ? "border-destructive" : ""}
                />
              )}
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
