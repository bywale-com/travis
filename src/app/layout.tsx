import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { SurfaceRegistryProvider } from "@/surfaces/SurfaceBoundary";
import "./globals.css";

const travisSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--travis-serif",
});

export const metadata: Metadata = {
  title: "Travis",
  description: "Voice interface between you and Cursor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FDF8F3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={travisSerif.variable}>
      <body>
        <AntdRegistry>
          <SurfaceRegistryProvider>{children}</SurfaceRegistryProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
