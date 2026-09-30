import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VisionFlow AI - AI-Powered Business Operating System",
  description: "Automate client acquisition, sales, service delivery, CRM intelligence, and business workflows with AI agents. The ultimate business operating system for agencies, consultants, and service providers.",
  keywords: ["VisionFlow AI", "AI automation", "CRM", "lead generation", "business operating system", "AI agents", "sales automation"],
  authors: [{ name: "VisionFlow AI" }],
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon_visionflow_space_z_ai_32x32-bqYGXju5bcyNGufSllPT9wrRopVDkr.png",
    shortcut: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon_visionflow_space_z_ai_32x32-bqYGXju5bcyNGufSllPT9wrRopVDkr.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
