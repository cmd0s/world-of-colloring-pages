import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { MiniKitProvider } from "@/components/minikit-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kolorowanka AI - Generuj kolorowanki dla dzieci",
  description:
    "Wygeneruj unikalne kolorowanki dla dzieci za pomocą AI. Wpisz pomysł, a my stworzymy kolorowankę gotową do wydrukowania na A4!",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} font-sans antialiased`}>
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
        <Analytics />
      </body>
    </html>
  )
}
