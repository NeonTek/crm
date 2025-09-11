"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { removeUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Building2, Users, FolderOpen, CheckSquare, Bell, BarChart3, LogOut, Menu, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    removeUser()
    router.push("/")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary">NeonTek</span>
          <span className="text-sm text-muted-foreground">| CRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t p-4 space-y-2">
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
          {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0", className)}>
        <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="bg-sidebar h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
