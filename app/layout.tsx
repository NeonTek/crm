import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "NeonTek | CRM",
  description: "Professional CRM system for managing clients, projects, and tasks",
  icons: {
    icon: "/lamp.png",
  },
  applicationName: "NeonTek CRM",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "CRM",
    "Client Management",
    "Project Management",
    "NeonTek",
    "Business Tools",
    "Domain & Hosting",
  ],
  authors: [{ name: "NeonTek", url: "https://neontek.co.ke" }],
  creator: "NeonTek",
  publisher: "NeonTek",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "NeonTek | CRM",
    description: "Manage clients, hosting, domains, and projects in one powerful CRM.",
    url: "https://crm.neontek.co.ke",
    siteName: "NeonTek CRM",
    images: [
      {
        url: "/lamp.png",
        width: 512,
        height: 512,
        alt: "NeonTek CRM",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeonTek | CRM",
    description: "Manage clients, hosting, domains, and projects in one powerful CRM.",
    images: ["/lamp.png"],
    creator: "@neontek",
  },
  themeColor: "#00BFFF",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
