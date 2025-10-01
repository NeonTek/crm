import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto">
      <div className="container text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} NeonTek. All Rights Reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="https://neontek.co.ke/legal/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="https://neontek.co.ke/legal/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
