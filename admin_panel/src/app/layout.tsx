import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SYSTEM ADMIN // TERMINAL",
  description: "Terminal CLI Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col relative text-glow">
        <div className="pointer-events-none fixed inset-0 z-50 scanlines" />
        <main className="flex-1 flex flex-col p-4 z-10 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
