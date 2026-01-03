import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SystemSettingsProvider } from "@/contexts/SystemSettingsContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FYPIFY - Final Year Project Management",
    template: "%s | FYPIFY",
  },
  description: "Manage your final year projects efficiently with FYPIFY - the comprehensive FYP management platform",
  keywords: ["fyp", "final year project", "project management", "university", "students"],
  authors: [{ name: "FYPIFY Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#9A22B5" },
    { media: "(prefers-color-scheme: dark)", color: "#7F1A8A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
          <ReactQueryProvider>
            <AuthProvider>
              <SystemSettingsProvider>
                {children}
                <Toaster 
                  position="top-right" 
                  richColors 
                  closeButton
                  toastOptions={{
                    duration: 4000,
                  }}
                />
              </SystemSettingsProvider>
            </AuthProvider>
          </ReactQueryProvider>
      </body>
    </html>
  );
}

