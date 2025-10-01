import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
