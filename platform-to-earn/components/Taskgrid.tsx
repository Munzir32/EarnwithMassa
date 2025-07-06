import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Coins, Users, Trophy, ExternalLink, CheckCircle, Award, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contract } from '@/contract'
import ABI from '@/contract/ABI.json'
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

interface TaskDetails {
  title: string
  description: string
  tokenSymbol?: string
}

interface TaskgridProps {
  taskId: string
}

const Taskgrid: React.FC<TaskgridProps> = ({ taskId }) => {
  const [task, setTask] = useState<Task | null>(null)
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const { data: taskData, isLoading, error } = useReadContract({
    address: contract as `0x${string}`,
    abi: ABI,
    functionName: 'getTask',
    args: [BigInt(taskId)],
  })

  // Get creator reputation
  const { stats: creatorStats } = useCreatorReputation(task?.creator || '')

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
    <Card
      key={task.id}
      className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105"
    >
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{taskDetails?.title}</CardTitle>
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
        </div>
        <CardDescription className="line-clamp-3 flex items-center gap-2">
          <span>Created by {task.creator.slice(0, 6)}...{task.creator.slice(-4)}</span>
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
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3 line-clamp-2">{taskDetails?.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Token Required:</span>
            <Badge variant="outline" className="font-semibold text-purple-600 border-purple-200">
              {taskDetails?.tokenSymbol || "Token"}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-green-600" />
              <span className="font-semibold">{task.rewardAmount} tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                {task.submissions.length}/{task.maxSubmissions}
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(task.submissions.length / task.maxSubmissions) * 100}%` }}
            ></div>
          </div>

          <Link href={`/task/${task.id}`}>
            <Button
              className="w-full"
              variant={task.status === "Open" ? "default" : "secondary"}
              disabled={task.status === "Closed"}
            >
              {task.status === "Open"
                ? "View & Submit"
                : task.status === "Full"
                  ? "View Submissions"
                  : "Task Closed"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default Taskgrid