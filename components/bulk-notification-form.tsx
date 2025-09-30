"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Client } from "@/lib/types";
import { Mail, Send } from "lucide-react";

export function BulkNotificationForm() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) {
          const clientsData = await response.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to load clients.");
      }
    };
    fetchClients();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(clients.map((client) => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientSelection = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients((prev) => [...prev, clientId]);
    } else {
      setSelectedClients((prev) => prev.filter((id) => id !== clientId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/notifications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientIds: selectedClients,
          subject,
          htmlContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send emails");
      }

      setSuccessMessage(result.message);
      setSelectedClients([]);
      setSubject("");
      setHtmlContent("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Send Bulk Notifications</CardTitle>
        <CardDescription>
          Create and send HTML formatted emails to multiple clients at once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select Clients</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="select-all"
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedClients.length === clients.length &&
                    clients.length > 0
                  }
                />
                <Label htmlFor="select-all">Select All</Label>
              </div>
              <hr className="my-2" />
              {clients.map((client) => (
                <div key={client.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={client.id}
                    onCheckedChange={(checked) =>
                      handleClientSelection(client.id, checked as boolean)
                    }
                    checked={selectedClients.includes(client.id)}
                  />
                  <Label htmlFor={client.id}>
                    {client.name} ({client.email})
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedClients.length} of {clients.length} clients selected.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Important Account Update"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="htmlContent">HTML Content</Label>
            <Textarea
              id="htmlContent"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<html>...</html>"
              rows={10}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={
              isLoading ||
              selectedClients.length === 0 ||
              !subject ||
              !htmlContent
            }
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading
              ? "Sending..."
              : `Send to ${selectedClients.length} clients`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
