"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { removeUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Users,
  FolderOpen,
  CheckSquare,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  Sun,
  Moon,
  Mail,
  LifeBuoy,
  DollarSign,
} from "lucide-react";
import { useTheme } from "next-themes";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Bulk Mail", href: "/dashboard/notifications/bulk", icon: Mail },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: DollarSign,
  },
  { name: "Support Tickets", href: "/dashboard/tickets", icon: LifeBuoy },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    removeUser();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NeonTek Logo"
            width={120}
            height={40}
            className="dark:invert"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col",
          className
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Trigger*/}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-40"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
