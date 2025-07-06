"use client"

import { useState, useEffect, useCallback } from "react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  Search, Filter } from "lucide-react"
import Taskgrid from "@/components/Taskgrid"
import { useWallet } from "@/hooks/useWallet"
import { contract } from "@/contract"
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3"



export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [taskIds, setTaskIds] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [taskCounter, setTaskCounter] = useState<bigint>(BigInt(0))

  const { isConnected, provider } = useWallet()

  const fetchTaskCounter = useCallback(async () => {
    if (!isConnected || !provider) {
      setLoading(false)
      return
    }

    try {
      console.log("TasksPage: Fetching task counter...")
      const taskContract = new SmartContract(provider, contract)
      
      // Add timeout to the contract call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      })
      
      const resultPromise = taskContract.read('taskCounter')
      const result = await Promise.race([resultPromise, timeoutPromise]) as any
      
      console.log("TasksPage: Raw task counter result:", result)
      console.log("TasksPage: Result value:", result.value)
      
      // Parse the task counter correctly - it returns a Uint8Array that needs to be converted to string first
      const counterStr = bytesToStr(result.value)
      const counter = parseInt(counterStr)
      console.log("TasksPage: Parsed task counter:", counter)
      
      setTaskCounter(BigInt(counter))
      
      const newMap = new Map<string, string>()
      if (counter > 0) {
        console.log(`TasksPage: Creating ${counter} task IDs`)
        for (let i = 0; i < counter; i++) {
          newMap.set(i.toString(), i.toString())
        }
        setTaskIds(newMap)
      }
      console.log("TasksPage: Task IDs map:", newMap)
    } catch (error) {
      console.error("TasksPage: Error fetching task counter:", error)
      // Set default values to prevent infinite loading
      setTaskCounter(BigInt(0))
      setTaskIds(new Map())
    } finally {
      setLoading(false)
    }
  }, [isConnected, provider])

  useEffect(() => {
    fetchTaskCounter()
  }, [fetchTaskCounter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800 border-green-200"
      case "Full":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks from blockchain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Available Tasks
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse and submit to token-gated tasks. Earn ERC-20 rewards for your contributions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60 backdrop-blur-sm border-white/20"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/60 backdrop-blur-sm border-white/20">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Grid */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 text-blue-400">🔗</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Wallet Required:</strong> Please connect your Massa Station wallet to view tasks from the blockchain.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">Connect your wallet to view tasks</p>
            <p className="text-sm text-gray-500">Tasks are stored on the Massa blockchain and require wallet connection to access.</p>
          </div>
        ) : taskIds.size === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 text-yellow-400">⚠️</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Demo Mode:</strong> No tasks found on blockchain. 
                    This could be due to network timeout or no tasks have been created yet.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">No tasks found on blockchain.</p>
            <p className="text-sm text-gray-500">Try refreshing or check your network connection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[...taskIds.entries()].map(([key, value]) => (
              <Taskgrid 
                key={key} 
                taskId={value}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
