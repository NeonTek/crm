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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { ClientRequest } from "@/lib/types";
import { Lightbulb } from "lucide-react";

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/portal/requests", { cache: "no-store" });
      if (res.ok) setRequests(await res.json());
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/portal/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to submit request");

      setTitle("");
      setDescription("");
      toast({
        title: "Success!",
        description: "Your idea has been submitted for review.",
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not submit your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: ClientRequest["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Ideas & Requests</h2>
      </div>
      <p className="text-muted-foreground">
        Have a new idea or need a small change? Submit it here for our team to
        review.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Submit an Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Add a testimonials page"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your idea in more detail..."
                    required
                    rows={5}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Request History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Submission History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading history...</p>
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{req.title}</h3>
                        <Badge className={getStatusColor(req.status)}>
                          {req.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Submitted on:{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  You haven't submitted any ideas yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
