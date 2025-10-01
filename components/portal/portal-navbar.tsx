"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Menu, LogOut, Building2 } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/portal/dashboard" },
  { name: "Support Tickets", href: "/portal/tickets" },
];

export function PortalNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/portal/dashboard" className="mr-6 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NeonTek Logo"
            width={100}
            height={30}
            className="dark:invert"
          />
          <span className="hidden font-bold sm:inline-block text-muted-foreground">
            | Client Portal
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Desktop Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
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
                          pathname === item.href
                            ? "bg-muted font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
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
