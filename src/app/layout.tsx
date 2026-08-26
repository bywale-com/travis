import type { Metadata, Viewport } from "next";
import { SurfaceRegistryProvider } from "@/surfaces/SurfaceBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travis",
  description: "Voice interface between you and Cursor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f6f4f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SurfaceRegistryProvider>{children}</SurfaceRegistryProvider>
      </body>
    </html>
  );
}
