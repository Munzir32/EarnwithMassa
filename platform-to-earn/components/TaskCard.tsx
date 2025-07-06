"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, ExternalLink, CheckCircle, Award, TrendingUp, AlertCircle, Loader2, MoreHorizontal, Eye, User, Coins, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { contract } from "@/contract"
import { useWallet } from "@/hooks/useWallet"
import { SmartContract, Args } from "@massalabs/massa-web3"
import { fetchIPFSData } from '@/lib/IpfsDataFetch'
import { useCreatorReputation } from '@/hooks/useCreatorReputation'
import { toast } from "@/hooks/use-toast"
import { useTasks } from '@/hooks/useTasks'

interface Submission {
    user: string
    submissionLink: string
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

interface TaskCardProps {
    id: string
}

interface TaskDetails {
    title: string
    description: string
    tokenSymbol?: string
}

const TaskCard: React.FC<TaskCardProps> = ({ id }) => {
    const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null)
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const { provider, address } = useWallet()
    const { tasks, isFetching, refetch } = useTasks()

    // Find the specific task by ID
    const task = tasks.find(t => t.id === Number(id))

    // Get creator reputation
    const { stats: creatorStats } = useCreatorReputation(task?.creator || '')

    // Parse task details from IPFS
    const parseTaskDetails = useCallback(async () => {
        if (!task?.details) {
            console.log("No task details available")
            return
        }

        try {
            console.log("Fetching task details from IPFS:", task.details)
            const data = await fetchIPFSData(task.details)
            console.log("IPFS data fetched:", data)
            setTaskDetails({
                title: data.title || "Untitled Task",
                description: data.description || "No description provided",
                tokenSymbol: data.tokenSymbol
            })
        } catch (error) {
            console.error('Error while fetching task details from IPFS:', error)
            // Fallback to parsing as JSON if IPFS fetch fails
            try {
                console.log("Attempting to parse task details as JSON")
                const parsed = JSON.parse(task.details)
                setTaskDetails({
                    title: parsed.title || "Untitled Task",
                    description: parsed.description || "No description provided",
                    tokenSymbol: parsed.tokenSymbol
                })
            } catch {
                console.log("Using fallback task details")
                setTaskDetails({
                    title: "Untitled Task",
                    description: task.details || "No description provided"
                })
            }
        }
    }, [task?.details])

    // Handle picking winner
    const handlePickWinner = async (winnerAddress: string) => {
        if (!task || !provider) {
            console.log("Cannot pick winner: no task or provider")
            return
        }

        console.log("Picking winner for task:", task.id, "winner:", winnerAddress)
        setIsLoading('pickWinner')
        try {
            const taskContract = new SmartContract(provider, contract)
            const args = new Args()
                .addU64(BigInt(task.id))
                .addString(winnerAddress)

            console.log("Calling pickWinner with args:", args)
            await taskContract.call('pickWinner', args)
            
            toast({
                title: "Winner Selected",
                description: `Winner selected successfully: ${formatAddress(winnerAddress)}`,
            })
            
            // Refresh task data
            console.log("Refreshing task data after picking winner")
            await refetch()
        } catch (error) {
            console.error('Error picking winner:', error)
            toast({
                title: "Failed to Pick Winner",
                description: error instanceof Error ? error.message : "Failed to select winner",
                variant: "destructive",
            })
        } finally {
            setIsLoading(null)
        }
    }

    // Format address for display
    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    // Get status color
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

    useEffect(() => {
        console.log("TaskCard useEffect triggered, task:", task)
        parseTaskDetails()
    }, [parseTaskDetails])

    if (isFetching) {
        console.log("TaskCard: Loading state")
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading task data...</span>
                </CardContent>
            </Card>
        )
    }

    if (!task) {
        console.log("TaskCard: No task found for id:", id)
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                    <div className="text-center">
                        <p className="text-gray-600 mb-2">Task not found</p>
                        <p className="text-sm text-gray-500 mb-4">
                            The requested task could not be loaded from the blockchain.
                        </p>
                        <Button 
                            size="sm" 
                            onClick={() => {
                                console.log("Retrying to fetch task data")
                                refetch()
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    console.log("TaskCard: Rendering task:", task)

    return (
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">{taskDetails?.title || `Task #${id}`}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(task.status)}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                            {task.winner && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Winner Selected
                                </Badge>
                            )}
                            {creatorStats && (
                                <Badge variant="outline" className="text-xs">
                                    {creatorStats.reputation === 'Excellent' && <Award className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation === 'Good' && <TrendingUp className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation === 'Fair' && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation === 'Poor' && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation}
                                </Badge>
                            )}
                    </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/task/${id}`, '_blank')}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-gray-600">{taskDetails?.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="w-3 h-3" />
                            Creator
                        </div>
                        <p className="font-mono text-xs">{formatAddress(task.creator)}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Coins className="w-3 h-3" />
                            Reward
                        </div>
                        <p className="font-semibold">{task.rewardAmount} tokens</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Submissions
                        </div>
                        <p>{task.submissions.length}/{task.maxSubmissions}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Status
                        </div>
                        <p>{task.status}</p>
                    </div>
                </div>

                {task.submissions.length > 0 && (
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>Submissions: {task.submissions.length}</span>
                            <span>Max: {task.maxSubmissions}</span>
                        </div>

                        <div className="space-y-2">
                            {task.submissions.map((submission: Submission, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-gray-600">
                                            {formatAddress(submission.user)}
                                        </span>
                                        {task.winner === submission.user && (
                                            <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Winner
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(submission.submissionLink, '_blank')}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            View
                                        </Button>
                                        {task.status !== "Closed" && address === task.creator && (
                                            <Button
                                                size="sm"
                                                onClick={() => handlePickWinner(submission.user)}
                                                disabled={isLoading === 'pickWinner'}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600"
                                            >
                                                {isLoading === 'pickWinner' ? (
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                )}
                                                Pick Winner
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {task.submissions.length === 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-center text-muted-foreground text-sm py-4">No submissions yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default TaskCard