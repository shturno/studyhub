import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "StudyHub - Plataforma de Estudos Gamificada",
  description: "Estude para concursos com gamificação e acompanhamento de progresso",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-deep-space text-foreground`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
