'use client'
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

import Navbar from "@/components/navbar"
import { WalletProvider } from "@/contexts/WalletContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>PlatformToEarn - Earn by Doing, Compete by Submitting</title>
        <meta name="description" content="Decentralized task marketplace where your skills earn you ERC-20 tokens with token-gated access." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <WalletProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}
