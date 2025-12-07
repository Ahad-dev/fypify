import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "FYPIFY - Final Year Project Management",
  description: "Manage your final year projects efficiently with FYPIFY",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
