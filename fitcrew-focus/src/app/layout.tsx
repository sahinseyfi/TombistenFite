import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitCrew Focus",
  description: "FitCrew topluluğu için mobil odaklı beslenme ve ilerleme takibi deneyimi.",
  metadataBase: new URL("https://fitcrew-focus.example.com"),
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0fb5ba",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-dvh bg-background text-foreground",
          "font-sans antialiased",
          "px-safe",
          inter.variable,
          montserrat.variable,
        )}
      >
        <div className="mx-auto min-h-dvh w-full max-w-mobile">
          {children}
        </div>
      </body>
    </html>
  );
}
