import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import { ThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TombistenFite",
  description: "Mobil odaklı MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh pb-16 bg-base-100 text-base-content`}>
        <ThemeProvider>
          <div className="container mx-auto px-4 pt-4">{children}</div>
          {/* Alt Navigasyon */}
          <div className="fixed inset-x-0 bottom-0 z-50">
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
