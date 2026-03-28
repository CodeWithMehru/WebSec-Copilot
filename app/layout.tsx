import type { Metadata } from "next";
import "./globals.css";
import "../styles/animations.css";
import { ConvexClientProvider } from "@/components/convex-provider";

import { ScanProvider } from "@/components/providers/scan-provider";

export const metadata: Metadata = {
  title: "WebSec Copilot",
  description: "AI-powered security auditing for AI-built web applications. Detect vulnerabilities, get AI-powered remediation, and ship securely.",
  openGraph: {
    title: "WebSec Copilot",
    description: "AI Security AI for AI-built web apps",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ConvexClientProvider>
          <ScanProvider>
            {children}
          </ScanProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
