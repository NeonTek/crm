import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
