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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  sender: "client" | "staff";
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in-progress" | "closed";
  messages: Message[];
}

export default function TicketViewPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/portal/tickets/${params.id}`);
      if (res.ok) {
        setTicket(await res.json());
      } else {
        // Handle not found or other errors
        setTicket(null);
      }
    } catch (error) {
      console.error("Failed to fetch ticket", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [params.id]);

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/portal/tickets/${params.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (!res.ok) throw new Error("Failed to send reply");

      setReplyMessage("");
      fetchTicket(); // Refresh the ticket to show the new message
      toast({ title: "Success", description: "Your reply has been sent." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send your reply.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusColor = (status: Ticket["status"]) => {
    if (status === "open") return "bg-green-100 text-green-800";
    if (status === "in-progress") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <p className="text-center p-8">Loading ticket...</p>;
  }

  if (!ticket) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button asChild variant="outline">
          <Link href="/portal/tickets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Tickets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Link
        href="/portal/tickets"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Tickets
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
              <CardDescription>
                View the conversation history for your ticket.
              </CardDescription>
            </div>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {ticket.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === "client" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-xl p-3 rounded-lg ${
                    msg.sender === "client"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {msg.sender === "client" ? "You" : "NeonTek Support"} •{" "}
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">Add a Reply</h3>
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              disabled={ticket.status === "closed"}
            />
            <Button
              onClick={handleReply}
              disabled={isReplying || ticket.status === "closed"}
            >
              <Send className="h-4 w-4 mr-2" />
              {isReplying ? "Sending..." : "Send Reply"}
            </Button>
            {ticket.status === "closed" && (
              <p className="text-sm text-muted-foreground">
                This ticket is closed. To reopen it, please submit a new ticket.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
