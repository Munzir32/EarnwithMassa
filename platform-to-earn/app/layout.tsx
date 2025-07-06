'use client'
import type React from "react"
// import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import '@rainbow-me/rainbowkit/styles.css';

import Navbar from "@/components/navbar"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '@/wagmi';

const client = new QueryClient();

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "PlatformToEarn - Earn by Doing, Compete by Submitting",
//   description: "Decentralized task marketplace where your skills earn you ERC-20 tokens with token-gated access.",
//   generator: 'v0.dev'
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <WagmiProvider config={config}>
          <QueryClientProvider client={client}>
            <RainbowKitProvider
            theme={lightTheme({
              accentColor: 'linear-gradient(to right, #7C3AED, #2563EB)', // Purple to Blue gradient
              accentColorForeground: '#FFFFFF', // White
            })}
            >
              <Navbar />
              <main>{children}</main>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>

      </body>
    </html>
  )
}
