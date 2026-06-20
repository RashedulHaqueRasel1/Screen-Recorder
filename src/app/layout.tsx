import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "RecStudio | Premium Online Screen & Webcam Recorder",
    template: "%s | RecStudio",
  },
  description:
    "A premium, free online screen and webcam recorder. Capture high-quality video, mic audio, and system sounds with no watermarks and instant downloads.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "RecStudio | Premium Online Screen & Webcam Recorder",
    description:
      "A premium, free online screen and webcam recorder. Capture high-quality video, mic audio, and system sounds with no watermarks and instant downloads.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecStudio | Premium Online Screen & Webcam Recorder",
    description:
      "A premium, free online screen and webcam recorder. Capture high-quality video, mic audio, and system sounds with no watermarks and instant downloads.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
