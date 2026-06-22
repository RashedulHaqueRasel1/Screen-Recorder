import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "RecStudio | Record, Edit & Share Videos in Seconds",
    template: "%s | RecStudio",
  },
  description:
    "Capture your screen, webcam, and microphone in high quality. Edit instantly with FFmpeg and upload directly to Google Drive with shareable links. No watermarks, no software install.",
  keywords: [
    "screen recorder",
    "webcam recorder",
    "video editor",
    "google drive upload",
    "loom alternative",
    "screen recording",
    "share videos",
  ],
  authors: [{ name: "RecStudio" }],
  metadataBase: new URL("https://recstudio.app"),
  openGraph: {
    title: "RecStudio | Record, Edit & Share Videos in Seconds",
    description:
      "Capture your screen, webcam, and microphone. Edit instantly and upload directly to Google Drive with one click.",
    type: "website",
    siteName: "RecStudio",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecStudio | Premium Screen & Webcam Recorder",
    description:
      "Capture, edit, and share videos in seconds. Premium, free, and 100% browser-based.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen selection:bg-purple-500/30 selection:text-purple-200`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
