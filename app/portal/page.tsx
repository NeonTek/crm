"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getIronSession } from "iron-session";
import { SessionData } from "@/lib/auth";

export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const res = await fetch("/api/portal/dashboard"); // Use an existing protected route

        if (res.ok) {
          router.replace("/portal/dashboard");
        } else {
          router.replace("/portal/login");
        }
      } catch (error) {
        router.replace("/portal/login");
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
