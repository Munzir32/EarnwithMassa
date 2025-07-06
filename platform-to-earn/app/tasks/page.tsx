"use client"

import { useState, useEffect, useCallback } from "react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  Search, Filter } from "lucide-react"
import Taskgrid from "@/components/Taskgrid"
import { useReadContract } from "wagmi"
import { contract } from "@/contract"
import ABI from "@/contract/ABI.json"



export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [taskIds, setTaskIds] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  const { data: taskCounter, refetch: refetchTaskCounter } = useReadContract({
    address: contract as `0x${string}`,
    abi: ABI,
    functionName: 'taskCounter',
  })

  const getTaskIds = useCallback(() => {
    try {
      if (!taskCounter) {
        console.log("taskCounter is undefined or null");
        return;
      }

      const newMap = new Map<string, string>();
      if (typeof taskCounter === 'bigint' && taskCounter > 0) {
        for (let i = 0; i < taskCounter; i++) {
          newMap.set(i.toString(), i.toString()); 
        }
        setTaskIds(new Map(newMap));
      } else {
        console.log("taskCounter isn't valid bigint:", taskCounter);
      }
    } catch (error) {
      console.error("Error setting task IDs:", error);
    }
  }, [taskCounter])

  useEffect(() => {
    getTaskIds()
  }, [taskCounter, getTaskIds])

  useEffect(() => {
    if (!taskCounter) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [taskCounter])

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
        {taskIds.size === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tasks found on blockchain.</p>
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

        {taskIds.size === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
