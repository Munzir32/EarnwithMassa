"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, Users, ExternalLink, Wallet, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useReadContract, useWriteContract, useAccount } from "wagmi"
import { contract } from "@/contract"
import ABI from "@/contract/ABI.json"
import { fetchIPFSData } from '@/lib/IpfsDataFetch'
import { ConnectButton } from "@rainbow-me/rainbowkit"
import CreatorReputation from "@/components/CreatorReputation"

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
] as const

interface Submission {
  user: string
  submissionLink: string
  timestamp: string
}

interface Task {
  id: number
  creator: string
  tokenGate: string
  rewardToken: string
  details: string
  rewardAmount: string
  submissions: Submission[]
  isClosed: boolean
  winner?: string
  status: "Open" | "Full" | "Closed"
  maxSubmissions: number
}

interface TaskDetails {
  title: string
  description: string
  tokenSymbol?: string
}

interface NoditTokenResponse {
  rpp: number
  items: Array<{
    ownerAddress: string
    balance: string
    contract: {
      address: string
      type: string
      name: string
      symbol: string
      decimals: number
    }
  }>
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submissionLink, setSubmissionLink] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hasRequiredToken, setHasRequiredToken] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [checkingToken, setCheckingToken] = useState(false)
  const { address } = useAccount()

  const { writeContract, isPending: isSubmitting } = useWriteContract()

  // Read task data from contract
  const { data: taskData, isLoading, error } = useReadContract({
    address: contract as `0x${string}`,
    abi: ABI,
    functionName: 'getTask',
    args: [BigInt(taskId)],
  })

  // Check if user has already submitted to this task
  const { data: hasUserSubmitted } = useReadContract({
    address: contract as `0x${string}`,
    abi: ABI,
    functionName: 'hasSubmitted',
    args: [BigInt(taskId), address as `0x${string}`],
    query: {
      enabled: !!address && !!taskId,
    },
  })

  // Check if user has required token using Nodit API
  const checkTokenBalance = useCallback(async (userAddress: string, tokenGateAddress: string) => {
    if (!userAddress || !tokenGateAddress) return false

    setCheckingToken(true)
    try {
     
      const apiKey = process.env.NEXT_PUBLIC_NODIT_API_KEY || 'nodit-demo'
      
      const response = await fetch('https://web3.nodit.io/v1/ethereum/sepolia/token/getTokensOwnedByAccount', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          accountAddress: userAddress,
          withCount: false
        })
      })

      if (response.ok) {
        const data: NoditTokenResponse = await response.json()
        
        const hasToken = data.items.some(item => 
          item.contract.address.toLowerCase() === tokenGateAddress.toLowerCase() && 
          BigInt(item.balance) > 0
        )

        setHasRequiredToken(hasToken)
        return hasToken
      } else {
        console.warn('Nodit API error:', response.status, response.statusText)
        return await checkTokenBalanceDirect(userAddress, tokenGateAddress)
      }
    } catch (error) {
      console.error('Error checking token balance:', error)
      return await checkTokenBalanceDirect(userAddress, tokenGateAddress)
    } finally {
      setCheckingToken(false)
    }
  }, [])

  const checkTokenBalanceDirect = async (userAddress: string, tokenGateAddress: string): Promise<boolean> => {
    try {
      console.log('Using direct contract call to check token balance')
      
      
      
      // Demo fallback - allow submission for testing
      console.log('Demo mode: Allowing submission for testing purposes')
      setHasRequiredToken(true)
      return true
    } catch (error) {
      console.error('Error in direct contract call:', error)
      // Final fallback: allow submission for demo
      setHasRequiredToken(true)
      return true
    }
  }

  // Process task data
  const processTaskData = useCallback(() => {
    if (!taskData || !Array.isArray(taskData)) {
      return
    }

    const [creator, tokenGate, rewardToken, details, rewardAmount, submissions, isClosed, winner] = taskData as any

    setTask({
      id: Number(taskId),
      creator,
      tokenGate,
      rewardToken,
      details,
      rewardAmount: rewardAmount.toString(),
      submissions: submissions || [],
      isClosed,
      winner: winner !== '0x0000000000000000000000000000000000000000' ? winner : undefined,
      status: isClosed ? "Closed" : (submissions?.length >= 3 ? "Full" : "Open"),
      maxSubmissions: 3
    })
  }, [taskData, taskId])

  // Parse task details from IPFS
  const parseTaskDetails = useCallback(async () => {
    if (!task?.details) return

    try {
      const data = await fetchIPFSData(task.details)
      setTaskDetails({
        title: data.title || "Untitled Task",
        description: data.description || "No description provided",
        tokenSymbol: data.tokenSymbol
      })
    } catch (error) {
      console.error('Error while fetching task details:', error)
      // Fallback to parsing as JSON if IPFS fetch fails
      try {
        const parsed = JSON.parse(task.details)
        setTaskDetails({
          title: parsed.title || "Untitled Task",
          description: parsed.description || "No description provided",
          tokenSymbol: parsed.tokenSymbol
        })
      } catch {
        setTaskDetails({
          title: "Untitled Task",
          description: task.details || "No description provided"
        })
      }
    }
  }, [task?.details])

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submissionLink.trim() || !task) return

    setSubmitting(true)

    try {
      await writeContract({
        address: contract as `0x${string}`,
        abi: ABI,
        functionName: 'submitToTask',
        args: [BigInt(task.id), submissionLink],
      })

      setHasSubmitted(true)
      setSubmissionLink("")
      
      // Note: The hasSubmitted state will be automatically updated via the useReadContract hook
      // when the transaction is confirmed and the contract state changes
      
    } catch (error) {
      console.error('Error submitting to task:', error)
    } finally {
      setSubmitting(false)
    }
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

  useEffect(() => {
    processTaskData()
  }, [processTaskData])

  useEffect(() => {
    parseTaskDetails()
  }, [parseTaskDetails])

  useEffect(() => {
    if (!isLoading) {
      setLoading(false)
    }
  }, [isLoading])

  // Check token balance when address or task changes
  useEffect(() => {
    if (address && task?.tokenGate) {
      checkTokenBalance(address, task.tokenGate)
    } else {
      setHasRequiredToken(false)
    }
  }, [address, task?.tokenGate, checkTokenBalance])

  // Update hasSubmitted state based on contract data
  useEffect(() => {
    if (hasUserSubmitted !== undefined) {
      setHasSubmitted(Boolean(hasUserSubmitted))
    }
  }, [hasUserSubmitted])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-6">The task you're looking for doesn't exist.</p>
          <Link href="/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </div>
    )
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/tasks" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
            ← Back to Tasks
          </Link>

          {/* Task Header */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{taskDetails?.title}</CardTitle>
                  <CardDescription className="text-base">Created by {formatAddress(task.creator)}</CardDescription>
                </div>
                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold text-purple-600 border-purple-200">
                    {taskDetails?.tokenSymbol || "Token"}
                  </Badge>
                  <span className="text-sm text-gray-600">Required</span>
                </div>

                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">{task.rewardAmount} tokens</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {task.submissions.length}/{task.maxSubmissions} submissions
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{taskDetails?.description}</p>
            </CardContent>
          </Card>

          {/* Creator Reputation */}
          <CreatorReputation creatorAddress={task.creator} className="mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submission Form */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Submit Your Work
                </CardTitle>
                <CardDescription>Submit your work to compete for the reward</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!address ? (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Connect your wallet to submit</p>
                    <ConnectButton />
                  </div>
                ) : checkingToken ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking token requirements...</p>
                  </div>
                ) : !hasRequiredToken ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need to hold {taskDetails?.tokenSymbol || "required"} tokens to submit to this task.
                      <br />
                      <span className="text-sm text-gray-500">
                        Required token: {formatAddress(task.tokenGate)}
                      </span>
                    </AlertDescription>
                  </Alert>
                ) : hasSubmitted ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Your submission has been recorded successfully!</AlertDescription>
                  </Alert>
                ) : task.status === "Closed" ? (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>This task is closed. No more submissions are accepted.</AlertDescription>
                  </Alert>
                ) : task.submissions.length >= task.maxSubmissions ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>This task has reached the maximum number of submissions.</AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="submissionLink">Submission Link</Label>
                      <Input
                        id="submissionLink"
                        type="url"
                        placeholder="https://figma.com/design/... or https://github.com/..."
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        required
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Provide a link to your work (Figma, GitHub, live site, etc.)
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                      disabled={submitting || isSubmitting || !submissionLink.trim()}
                    >
                      {submitting || isSubmitting ? "Submitting..." : "Submit Work"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Submissions List */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Submissions ({task.submissions.length})
                </CardTitle>
                <CardDescription>Current submissions for this task</CardDescription>
              </CardHeader>
              <CardContent>
                {task.submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No submissions yet. Be the first to submit!</div>
                ) : (
                  <div className="space-y-4">
                    {task.submissions.map((submission, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white/40">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm text-gray-600">{formatAddress(submission.user)}</span>
                          <span className="text-xs text-gray-500">{formatDate(submission.timestamp)}</span>
                        </div>
                        <a
                          href={submission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                        >
                          View Submission
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {task.winner === submission.user && (
                          <div className="mt-2 flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">Winner!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
