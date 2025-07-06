"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Wallet, LogOut } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress] = useState("0x1234...5678")

  const { address, isConnected } = useAccount()

  const connectWallet = () => {
    setWalletConnected(true)
  }

  const disconnectWallet = () => {
    setWalletConnected(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PlatformToEarn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/tasks" className="text-gray-700 hover:text-purple-600 transition-colors">
              Tasks
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-purple-600 transition-colors">
              Admin
            </Link>
            <Link href="/reputation-demo" className="text-gray-700 hover:text-purple-600 transition-colors">
              Reputation Demo
            </Link>

            <ConnectButton />

            {/* {walletConnected ? (
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {walletAddress}
                </Badge>
                <Button variant="outline" size="sm" onClick={disconnectWallet} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )} */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/tasks"
                className="text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tasks
              </Link>
              <Link
                href="/admin"
                className="text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
              <Link
                href="/reputation-demo"
                className="text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Reputation Demo
              </Link>

              <ConnectButton />

              {/* {walletConnected ? (
                <div className="flex flex-col space-y-2">
                  <Badge variant="outline" className="font-mono text-xs w-fit">
                    {walletAddress}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="flex items-center gap-2 w-fit"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-fit"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )} */}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
