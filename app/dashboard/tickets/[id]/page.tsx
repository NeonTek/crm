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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  sender: "client" | "staff";
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  clientName: string;
  subject: string;
  status: "open" | "in-progress" | "closed";
  messages: Message[];
}

export default function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${params.id}`);
      if (res.ok) setTicket(await res.json());
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
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      setReplyMessage("");
      fetchTicket();
      toast({ title: "Success", description: "Your reply has been sent." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send reply.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchTicket();
      toast({
        title: "Success",
        description: `Ticket status updated to ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <p className="text-center p-8">Loading ticket...</p>;
  if (!ticket) return <p className="text-center p-8">Ticket not found.</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tickets"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Tickets
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{ticket.subject}</CardTitle>
              <CardDescription>
                Conversation with {ticket.clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.sender === "staff" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xl p-3 rounded-lg ${
                      msg.sender === "staff"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {msg.sender === "staff" ? "You" : ticket.clientName} •{" "}
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
                placeholder="Type your response..."
              />
              <Button onClick={handleReply} disabled={isReplying}>
                {isReplying ? "Sending..." : "Send Reply"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Client</Label>
                <p className="text-sm font-medium">{ticket.clientName}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
