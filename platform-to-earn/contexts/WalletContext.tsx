"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { WalletState, WalletAccount } from "@/types/stream"
import { toast } from "@/hooks/use-toast"
import { getWallets, WalletName } from "@massalabs/wallet-provider"

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider?: any
  isConnecting?: boolean
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<any>()
  const [userAddress, setUserAddress] = useState("")
  const [balance, setBalance] = useState("")
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch balance for connected wallet
  const fetchBalance = useCallback(async (address: string) => {
    try {
      const walletList = await getWallets()
      const wallet = walletList.find(
        (provider) => provider.name() === WalletName.Bearby
      )

      if (!wallet) {
        console.log("No Massa Station wallet found")
        setError("No Massa Station wallet found. Please install Massa Station.")
        toast({
          title: "Wallet Not Found",
          description: "Please install Massa Station wallet to continue.",
          variant: "destructive",
        })
        return
      }

      const accounts = await wallet.accounts()

      if (accounts.length === 0) {
        console.log("No accounts found in Massa Station wallet")
        setError("No accounts found in Massa Station wallet. Please create an account.")
        toast({
          title: "No Accounts",
          description: "Please create an account in Massa Station wallet.",
          variant: "destructive",
        })
        return
      }

      const selectedAccount = accounts[0]
      const balanceValue = await selectedAccount.balance(true)
      setBalance(`${balanceValue} MAS`)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance("0 MAS")
    }
  }, [])

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (userAddress) {
      await fetchBalance(userAddress)
    }
  }, [userAddress, fetchBalance])

  const initProvider = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const walletList = await getWallets()
      const wallet = walletList.find(
        (provider) => provider.name() === WalletName.Bearby
      )

      if (!wallet) {
        console.log("No Massa Station wallet found")
        setError("No Massa Station wallet found. Please install Massa Station.")
        toast({
          title: "Wallet Not Found",
          description: "Please install Massa Station wallet to continue.",
          variant: "destructive",
        })
        return
      }

      const accounts = await wallet.accounts()

      if (accounts.length === 0) {
        console.log("No accounts found in Massa Station wallet")
        setError("No accounts found in Massa Station wallet. Please create an account.")
        toast({
          title: "No Accounts",
          description: "Please create an account in Massa Station wallet.",
          variant: "destructive",
        })
        return
      }

      const selectedAccount = accounts[0]
      const balanceValue = await selectedAccount.balance(true)
      setBalance(`${balanceValue} MAS`)
      setProvider(selectedAccount)
      setUserAddress(selectedAccount.address)
      setIsConnected(true)
      
      // Fetch initial balance
      await fetchBalance(selectedAccount.address)
      
      console.log('Connected to wallet:', selectedAccount.address)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${selectedAccount.address.slice(0, 8)}...${selectedAccount.address.slice(-6)}`,
      })
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      
      // Handle specific favicon error
      if (error instanceof Error && error.message.includes('favicon')) {
        setError("Website favicon is required. Please ensure the page is fully loaded.")
        toast({
          title: "Favicon Required",
          description: "Please refresh the page and try again. The website needs a favicon to connect to your wallet.",
          variant: "destructive",
        })
      } else {
        setError(error instanceof Error ? error.message : "Failed to connect to wallet")
        toast({
          title: "Connection Failed",
          description: "Failed to connect to wallet. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }, [fetchBalance])

  /**
   * Connect to wallet
   */
  const connect = async () => {
    await initProvider()
  }

  /**
   * Disconnect from wallet
   */
  const disconnect = async () => {
    disconnectWallet()
  }

  /**
   * Auto-connect if previously connected
   */
  useEffect(() => {
    // Temporarily disabled auto-connect to prevent favicon errors
    // Users can manually connect when ready
    // if (typeof window !== 'undefined') {
    //   const wasConnected = localStorage.getItem('massa-wallet-connected')
    //   if (wasConnected === 'true') {
    //     setTimeout(() => {
    //       initProvider()
    //     }, 100)
    //   }
    // }
  }, [initProvider])

  // Save connection state to localStorage
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem('massa-wallet-connected', 'true')
    } else {
      localStorage.removeItem('massa-wallet-connected')
    }
  }, [isConnected])

  const disconnectWallet = () => {
    setProvider(undefined)
    setUserAddress("")
    setBalance("")
    setIsConnected(false)
    setError(null)
    localStorage.removeItem('massa-wallet-connected')
    console.log('Disconnected from wallet')
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet.",
    })
  }

  const walletState: WalletState = {
    isConnected,
    address: userAddress || null,
    balance: balance || null,
    isLoading: isConnecting,
    error,
  }

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connect,
        disconnect,
        provider,
        isConnecting,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
} 