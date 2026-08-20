import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";

import ThemeRegistry from "@/components/providers/ThemeRegistry";
import AuthClientBootstrap from "@/lib/authInterceptor";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextCart",
  description: "India's Next Generation Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <ThemeRegistry>
          <AuthClientBootstrap />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}