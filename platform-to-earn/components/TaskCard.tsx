import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, ExternalLink, CheckCircle, Award, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { contract } from "@/contract"
import ABI from "@/contract/ABI.json"
import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { fetchIPFSData } from '@/lib/IpfsDataFetch'
import { useCreatorReputation } from '@/hooks/useCreatorReputation'

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
    const [task, setTask] = useState<Task | null>(null)
    const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null)
    const [pickingWinner, setPickingWinner] = useState(false)
    const { address } = useAccount()

    const { writeContract, isPending: isPickingWinner } = useWriteContract()

    // Read task data from contract
    const { data: taskData, isLoading, error } = useReadContract({
        address: contract as `0x${string}`,
        abi: ABI,
        functionName: 'getTask',
        args: [BigInt(id)],
    })

    // Get creator reputation
    const { stats: creatorStats } = useCreatorReputation(task?.creator || '')

    // Process task data
    const processTaskData = useCallback(() => {
        if (!taskData || !Array.isArray(taskData)) {
            return
        }

        const [creator, tokenGate, rewardToken, details, rewardAmount, submissions, isClosed, winner] = taskData as any

        setTask({
            id: Number(id),
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
    }, [taskData, id])

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

    // Handle picking winner
    const handlePickWinner = async (winnerAddress: string) => {
        if (!task) return

        setPickingWinner(true)
        try {
            await writeContract({
                address: contract as `0x${string}`,
                abi: ABI,
                functionName: 'pickWinner',
                args: [BigInt(task.id), winnerAddress as `0x${string}`],
            })
        } catch (error) {
            console.error('Error picking winner:', error)
        } finally {
            setPickingWinner(false)
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
        processTaskData()
    }, [processTaskData])

    useEffect(() => {
        parseTaskDetails()
    }, [parseTaskDetails])

    if (isLoading) {
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !task) {
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                    <p className="text-red-600">Error loading task</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl mb-2">{taskDetails?.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            Created by {formatAddress(task.creator)}
                            {creatorStats && (
                                <Badge variant="outline" className="text-xs">
                                    {creatorStats.reputation === 'Excellent' && <Award className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation === 'Good' && <TrendingUp className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation === 'Fair' && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation === 'Poor' && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {creatorStats.reputation}
                                </Badge>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        {task.winner && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                <Trophy className="w-3 h-3 mr-1" />
                                Winner Selected
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-4">{taskDetails?.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <span className="text-sm text-gray-600">Token Gate:</span>
                        <p className="font-mono text-sm">{formatAddress(task.tokenGate)}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Reward:</span>
                        <p className="font-semibold">{task.rewardAmount} tokens</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Submissions:</span>
                        <p className="font-semibold">
                            {task.submissions.length}/{task.maxSubmissions}
                        </p>
                    </div>
                </div>

                {task.submissions.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-3">Submissions:</h4>
                        <div className="space-y-3">
                            {task.submissions.map((submission: Submission, index: number) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white/40">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-sm text-gray-600">
                                            {formatAddress(submission.user)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <a
                                            href={submission.submissionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                                        >
                                            View Submission
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        {task.status !== "Closed" && address === task.creator && (
                                            <Button
                                                size="sm"
                                                onClick={() => handlePickWinner(submission.user)}
                                                disabled={pickingWinner || isPickingWinner}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600"
                                            >
                                                {pickingWinner ? "Selecting..." : "Pick Winner"}
                                            </Button>
                                        )}
                                    </div>
                                    {task.winner === submission.user && (
                                        <div className="mt-2 flex items-center gap-2 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Winner!</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {task.submissions.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No submissions yet</p>
                )}
            </CardContent>
        </Card>
    )
}

export default TaskCard