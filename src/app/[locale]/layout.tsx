import type React from "react";
import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyHub — PRESS START",
  description: "Estude para concursos — modo gamificado. INSERT COIN TO BEGIN.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className={`dark ${pressStart2P.variable} ${vt323.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-[#080010] text-[#e0e0ff]">
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0d001a",
                  border: "2px solid #00ff41",
                  color: "#e0e0ff",
                  fontFamily: "var(--font-mono-pixel), monospace",
                  fontSize: "18px",
                  borderRadius: "0",
                },
              }}
            />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
