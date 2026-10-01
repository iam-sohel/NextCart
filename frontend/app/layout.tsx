import type { Metadata } from "next";

import ThemeRegistry from "@/components/providers/ThemeRegistry";
import AuthClientBootstrap from "@/lib/authInterceptor";

import "./globals.css";

export const metadata: Metadata = {
  title: "HavLook",
  description: "HavLook — Your marketplace for products, brands and everyday essentials.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthClientBootstrap />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
