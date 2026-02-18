import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "../../components/ReduxProvider";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VideoTube | Exclusive Social Media Platform",
  description: "VideoTube is an Exlusive social media platform designed for GenZ's with some new modern features and UI compared to YouTube and also chat functionality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* So whenever we use server rendering, normally there is a warning when server and the client render different content well that's what we're going to get with next themes */}
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <ReduxProvider>
        <Providers>
          
        {children}
        </Providers>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
