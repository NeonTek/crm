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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";

// You will create this component in the next step
import { NewTicketForm } from "@/components/portal/new-ticket-form";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in-progress" | "closed";
  updatedAt: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/portal/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
    }
  };

  if (showCreateForm) {
    return (
      <div className="p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => setShowCreateForm(false)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        <NewTicketForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchTickets();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>
                View your support history or create a new ticket.
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading tickets...</p>
          ) : (
            <div className="space-y-4">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <Link
                    href={`/portal/tickets/${ticket.id}`}
                    key={ticket.id}
                    className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{ticket.subject}</p>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated:{" "}
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  You have no support tickets.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
