import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ai4Planning",
  description:
    "Initialize authentication sequence to modify living blueprints and AI-optimized structural modules.",
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
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="font-sans antialiased">
        {children}

        {/* ✅ Toast container (required for toast messages) */}
       <Toaster
  position="bottom-right"
  containerStyle={{
    bottom: 250, // 👈 moves toast upward from bottom
    right: 170,
  }}
  toastOptions={{
    duration: 5000,
    style: {
      animation: "slideUpRight 0.4s ease-out",
    },
  }}
/>
      </body>
    </html>
  )
}
