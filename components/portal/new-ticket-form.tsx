"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { BookText } from "lucide-react";

interface NewTicketFormProps {
  onSuccess: () => void;
}

interface ArticleSuggestion {
  _id: string;
  title: string;
  slug: string;
}

export function NewTicketForm({ onSuccess }: NewTicketFormProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // This useEffect hook handles the search as the user types
  useEffect(() => {
    // Don't search if the subject is too short
    if (subject.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    // Debounce the search to avoid too many API calls
    const searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/kb/search?q=${encodeURIComponent(subject)}`
        );
        if (res.ok) {
          setSuggestions(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(searchTimeout);
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Your ticket has been submitted.",
        });
        onSuccess();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit ticket.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Support Ticket</CardTitle>
        <CardDescription>
          Describe your issue, and our team will get back to you shortly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Website is down"
              required
            />
          </div>

          {/* --- SMART DEFLECTION UI --- */}
          {(isSearching || suggestions.length > 0) && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Suggested Articles:</h4>
              {isSearching ? (
                <p className="text-sm text-muted-foreground">Searching...</p>
              ) : (
                <ul className="space-y-1">
                  {suggestions.map((article) => (
                    <li key={article._id}>
                      <Link
                        href={`/help/${article.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <BookText className="h-4 w-4" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* --- END OF SMART DEFLECTION UI --- */}

          <div className="space-y-2">
            <Label htmlFor="message">How can we help?</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide as much detail as possible..."
              rows={6}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
