import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Orbitron } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { SurfaceRegistryProvider } from "@/surfaces/SurfaceBoundary";
import "./globals.css";

const travisSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--travis-serif",
});

/** The TRAVIS wordmark, every time the logo appears. Not the body face. */
const travisWordmark = Orbitron({
  weight: ["600", "800"],
  subsets: ["latin"],
  variable: "--travis-wordmark",
});

export const metadata: Metadata = {
  title: "Travis",
  description: "Voice interface between you and Cursor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F3EFE7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${travisSerif.variable} ${travisWordmark.variable}`}
    >
      <body>
        <AntdRegistry>
          <SurfaceRegistryProvider>{children}</SurfaceRegistryProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
