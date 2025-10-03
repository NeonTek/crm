"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Menu, LogOut, Building2, User, Bell } from "lucide-react";
import type { Client, Notification } from "@/lib/types";

const navigation = [
  { name: "Dashboard", href: "/portal/dashboard" },
  { name: "Billing", href: "/portal/billing" },
  { name: "Support Tickets", href: "/portal/tickets" },
  { name: "Notifications", href: "/portal/notifications" },
];

export function PortalNavbar() {
  const [client, setClient] = useState<Client | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const res = await fetch("/api/portal/profile", { cache: "no-store" });
        if (res.ok) setClient(await res.json());
      } catch (error) {
        console.error("Failed to fetch client info", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/portal/notifications", {
          cache: "no-store",
        });
        if (res.ok) setNotifications(await res.json());
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchClientInfo();
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center gap-6">
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="NeonTek Logo"
              width={100}
              height={30}
              className="dark:invert"
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  pathname.startsWith(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Button asChild variant="ghost" size="icon">
            <Link href="/portal/notifications" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </Link>
          </Button>

          {/* --- START OF FIX: Simplified Profile and Logout Buttons --- */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/portal/profile">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {client?.name?.charAt(0).toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <span className="line-clamp-1">
                  {client?.name || "My Profile"}
                </span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          {/* --- END OF FIX --- */}

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs">
              <div className="flex h-full flex-col">
                <div className="p-4 border-b">
                  <Link
                    href="/portal/dashboard"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Client Portal</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 p-4">
                  {navigation.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "rounded-md p-2 transition-colors hover:bg-muted",
                          pathname.startsWith(item.href)
                            ? "bg-muted font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link
                      href="/portal/profile"
                      className={cn(
                        "rounded-md p-2 transition-colors hover:bg-muted",
                        pathname === "/portal/profile"
                          ? "bg-muted font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      My Profile
                    </Link>
                  </SheetClose>
                </nav>
                <div className="mt-auto p-4 border-t">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
