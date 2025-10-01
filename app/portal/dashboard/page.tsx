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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import type { Client, Project, Task } from "@/lib/types";
import {
  Building2,
  FolderOpen,
  CheckSquare,
  LogOut,
  Server,
  Globe,
  Calendar,
  DollarSign,
  AlertTriangle,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  client: Client;
  projects: Project[];
  services: {
    hosting: {
      provider?: string;
      expiryDate?: string;
      price?: number;
      daysRemaining: number | null;
    };
    domain: {
      name?: string;
      expiryDate?: string;
      price?: number;
      daysRemaining: number | null;
    };
  };
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/portal/dashboard");
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        } else {
          router.push("/portal/login");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        router.push("/portal/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { client, projects, services } = data;

  const getStatusColor = (status: Project["status"] | Task["status"]) => {
    // ... (keep the existing getStatusColor function)
    switch (status) {
      case "planning":
      case "todo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "on-hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDaysRemainingColor = (days: number | null) => {
    if (days === null) return "text-muted-foreground";
    if (days <= 7) return "text-red-500 font-bold";
    if (days <= 30) return "text-orange-500 font-semibold";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-muted/40">

      <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 sm:py-4 md:grid-cols-3">
        {/* Left Column for Services */}
        <div className="md:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            Your Services
          </h2>
          {/* Hosting Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Hosting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {services.hosting.provider ? (
                <>
                  <p>
                    <strong>Provider:</strong> {services.hosting.provider}
                  </p>
                  <p>
                    <strong>Expires on:</strong>{" "}
                    {new Date(
                      services.hosting.expiryDate!
                    ).toLocaleDateString()}
                  </p>
                  {services.hosting.price && (
                    <p>
                      <strong>Renewal Price:</strong> KES{" "}
                      {services.hosting.price.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <AlertTriangle
                      className={`h-5 w-5 ${getDaysRemainingColor(
                        services.hosting.daysRemaining
                      )}`}
                    />
                    <span
                      className={getDaysRemainingColor(
                        services.hosting.daysRemaining
                      )}
                    >
                      {services.hosting.daysRemaining} days remaining
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No hosting details available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Domain Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {services.domain.name ? (
                <>
                  <p>
                    <strong>Domain:</strong> {services.domain.name}
                  </p>
                  <p>
                    <strong>Expires on:</strong>{" "}
                    {new Date(services.domain.expiryDate!).toLocaleDateString()}
                  </p>
                  {services.domain.price && (
                    <p>
                      <strong>Renewal Price:</strong> KES{" "}
                      {services.domain.price.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <AlertTriangle
                      className={`h-5 w-5 ${getDaysRemainingColor(
                        services.domain.daysRemaining
                      )}`}
                    />
                    <span
                      className={getDaysRemainingColor(
                        services.domain.daysRemaining
                      )}
                    >
                      {services.domain.daysRemaining} days remaining
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No domain details available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Support Tickets Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5" />
                Support Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Need help? Open a new support ticket.
              </p>
              <Button asChild className="w-full">
                <Link href="/portal/tickets">Go to Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column for Projects */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Your Projects
          </h2>
          {projects.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {projects.map((project) => (
                <AccordionItem value={project.id} key={project.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full pr-4">
                      <span className="font-semibold text-lg text-left">
                        {project.name}
                      </span>
                      <Badge
                        className={`${getStatusColor(
                          project.status
                        )} mt-2 md:mt-0`}
                      >
                        {project.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-background rounded-b-md">
                    <p className="text-muted-foreground mb-4">
                      {project.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  You don't have any projects with us yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
