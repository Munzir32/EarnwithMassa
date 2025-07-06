export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  isLoading: boolean
  error: string | null
}

export interface WalletAccount {
  address: string
  publicKey?: string
  name?: string
}

export interface WalletProvider {
  name: () => string
  accounts: () => Promise<any[]>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
} 