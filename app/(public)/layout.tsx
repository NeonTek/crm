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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="NeonTek Logo"
                width={100}
                height={30}
                className="dark:invert"
              />
            </Link>
          </div>
        </div>
      </header>
      <navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
