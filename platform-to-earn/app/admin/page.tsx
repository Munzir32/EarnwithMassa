"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle } from "lucide-react"
import { useWriteContract } from "wagmi"
import { contract } from "@/contract"
import ABI from "@/contract/ABI.json"
import { PlatformIPFS } from "@/lib/ipfsUpload"
import Manage from "@/components/Manage"

interface Task {
  id: number
  title: string
  description: string
  tokenGate: string
  tokenSymbol: string
  rewardToken: string
  rewardAmount: string
  submissions: Submission[]
  maxSubmissions: number
  status: "Open" | "Full" | "Closed"
  creator: string
  winner?: string
}

interface Submission {
  user: string
  submissionLink: string
  timestamp: string
}

export default function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [pickingWinner, setPickingWinner] = useState<number | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tokenGate, setTokenGate] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [rewardToken, setRewardToken] = useState("")
  const [rewardAmount, setRewardAmount] = useState("")

  const { writeContractAsync } = useWriteContract()

  const token = "0x33B8d1D5841A989ca3F1566158CE96e260Ff4376"

  // Mock data - replace with actual smart contract calls
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: 0,
        title: "Design a Modern Landing Page",
        description: "Create a responsive landing page for a DeFi protocol",
        tokenGate: "0x1234567890abcdef1234567890abcdef12345678",
        tokenSymbol: "$ZORA",
        rewardToken: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
        rewardAmount: "500",
        submissions: [
          {
            user: "0x1111111111111111111111111111111111111111",
            submissionLink: "https://figma.com/design/example1",
            timestamp: "2024-01-15T10:30:00Z",
          },
          {
            user: "0x2222222222222222222222222222222222222222",
            submissionLink: "https://github.com/user/landing-page",
            timestamp: "2024-01-16T14:20:00Z",
          },
        ],
        maxSubmissions: 3,
        status: "Open",
        creator: "0x9876543210fedcba9876543210fedcba98765432",
      },
      {
        id: 1,
        title: "Build React Component Library",
        description: "Develop a set of reusable React components",
        tokenGate: "0x2345678901bcdef12345678901bcdef123456789",
        tokenSymbol: "$DEGEN",
        rewardToken: "0xbcdefghijklmnopqrstuvwxyz1234567890abcdef",
        rewardAmount: "1000",
        submissions: [
          {
            user: "0x3333333333333333333333333333333333333333",
            submissionLink: "https://github.com/user/component-lib",
            timestamp: "2024-01-17T09:15:00Z",
          },
          {
            user: "0x4444444444444444444444444444444444444444",
            submissionLink: "https://storybook.example.com",
            timestamp: "2024-01-18T16:45:00Z",
          },
          {
            user: "0x5555555555555555555555555555555555555555",
            submissionLink: "https://npm.js/package/my-components",
            timestamp: "2024-01-19T11:20:00Z",
          },
        ],
        maxSubmissions: 3,
        status: "Full",
        creator: "0x8765432109edcba8765432109edcba8765432109",
      },
    ]

    setTimeout(() => {
      setTasks(mockTasks)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    // Mock task creation - replace with actual smart contract call
    // setTimeout(() => {
    //   const newTask: Task = {
    //     id: tasks.length,
    //     title,
    //     description,
    //     tokenGate,
    //     tokenSymbol,
    //     rewardToken,
    //     rewardAmount,
    //     submissions: [],
    //     maxSubmissions: 3,
    //     status: "Open",
    //     creator: "0x9876543210fedcba9876543210fedcba98765432",
    //   }

    //   setTasks([...tasks, newTask])

      try {
          const res = await PlatformIPFS({
            title: title,
            description: description,
            tokenSymbol: tokenSymbol
          })


          const response = await writeContractAsync({
            address: contract,
            abi: ABI,
            functionName: "createTask",
            args: [tokenGate, tokenGate, 2, res]
          })
          
          console.log(response)

          setTitle("")
          setDescription("")
          setTokenGate("")
          setTokenSymbol("")
          setRewardToken("")
          setRewardAmount("")
      } catch (error) {
        console.log(error)
      }

      // Reset form
     

      setCreating(false)
    // }, 2000)
  }

  const handlePickWinner = async (taskId: number, winnerAddress: string) => {
    setPickingWinner(taskId)

    // Mock winner selection - replace with actual smart contract call
    setTimeout(() => {
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: "Closed" as const, winner: winnerAddress } : task,
        ),
      )
      setPickingWinner(null)
    }, 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create new tasks and manage submissions. Pick winners to distribute rewards.
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="create">Create Task</TabsTrigger>
              <TabsTrigger value="manage">Manage Tasks</TabsTrigger>
            </TabsList>

            {/* Create Task Tab */}
            <TabsContent value="create">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Task
                  </CardTitle>
                  <CardDescription>Set up a new task with token gating and ERC-20 rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Design a Modern Landing Page"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed description of the task requirements..."
                        required
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tokenGate">Token Gate Address</Label>
                        <Input
                          id="tokenGate"
                          value={tokenGate}
                          onChange={(e) => setTokenGate(e.target.value)}
                          placeholder="0x..."
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tokenSymbol">Token Symbol</Label>
                        <Input
                          id="tokenSymbol"
                          value={tokenSymbol}
                          onChange={(e) => setTokenSymbol(e.target.value)}
                          placeholder="e.g., $ZORA"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rewardToken">Reward Token Address</Label>
                        <Input
                          id="rewardToken"
                          value={rewardToken}
                          onChange={(e) => setRewardToken(e.target.value)}
                          placeholder="0x..."
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rewardAmount">Reward Amount</Label>
                        <Input
                          id="rewardAmount"
                          type="number"
                          value={rewardAmount}
                          onChange={(e) => setRewardAmount(e.target.value)}
                          placeholder="500"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Make sure you have approved the reward tokens before creating the task.
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                      disabled={creating}
                    >
                      {creating ? "Creating Task..." : "Create Task"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Tasks Tab */}
            <TabsContent value="manage">
              <Manage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
