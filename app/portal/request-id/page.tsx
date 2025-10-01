"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useState } from "react";

export default function RequestIdPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/portal/request-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description:
            "If your email is in our system, you'll receive your Client ID shortly.",
        });
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Request Client ID</CardTitle>
          <CardDescription>
            Enter your email address to receive your Client ID. You will need
            this ID to log in to the client portal. You will receive it via email you enter below if it is registered on our system.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send ID"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Remember your ID?{" "}
              <Link
                href="/portal/login"
                className="font-semibold text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Don't know your email?{" "}
              <Link
                href="https://neontek.co.ke/contact"
                className="font-semibold text-primary hover:underline"
              >
                Ask Us
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
