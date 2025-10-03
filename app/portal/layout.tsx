import { PortalNavbar } from "@/components/portal/portal-navbar";
import { Footer } from "@/components/footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <PortalNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
