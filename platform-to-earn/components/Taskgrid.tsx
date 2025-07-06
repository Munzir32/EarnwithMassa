import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Coins, Users, Trophy, ExternalLink, CheckCircle, Award, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import { contract } from '@/contract'
import { SmartContract, Args } from '@massalabs/massa-web3'
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
  const [error, setError] = useState<string | null>(null)

  const { isConnected, provider } = useWallet()

  // Get creator reputation
  const { stats: creatorStats } = useCreatorReputation(task?.creator || '')

  const fetchTaskData = useCallback(async () => {
    if (!isConnected || !provider) {
      console.log("Taskgrid: No provider available")
      setLoading(false)
      return
    }

    try {
      console.log(`Taskgrid: Fetching task ${taskId}...`)
      const taskContract = new SmartContract(provider, contract)
      const args = new Args().addU64(BigInt(taskId))
      const result = await taskContract.read('getTask', args)
      const data = result.value

      if (!data || data.length === 0) {
        console.log(`Taskgrid: Task ${taskId} is empty`)
        setError('Task not found or empty')
        setLoading(false)
        return
      }

      // Parse the returned data using Args
      const argsParsed = new Args(data)
      console.log(`Taskgrid: Parsing task ${taskId} data:`, argsParsed)

      // Check if the task data is valid (not empty)
      if (argsParsed.serialized.length === 0) {
        console.log(`Taskgrid: Task ${taskId} has no data`)
        setError('Task has no data')
        setLoading(false)
        return
      }

      const creator = argsParsed.nextString()
      if (!creator || creator === "") {
        console.log(`Taskgrid: Task ${taskId} has invalid creator`)
        setError('Invalid task data')
        setLoading(false)
        return
      }

      const tokenGate = argsParsed.nextString()
      if (!tokenGate || tokenGate === "") {
        console.log(`Taskgrid: Task ${taskId} has invalid tokenGate`)
        setError('Invalid task data')
        setLoading(false)
        return
      }

      const rewardToken = argsParsed.nextString()
      if (!rewardToken || rewardToken === "") {
        console.log(`Taskgrid: Task ${taskId} has invalid rewardToken`)
        setError('Invalid task data')
        setLoading(false)
        return
      }

      const rewardAmount = argsParsed.nextU64().toString()
      if (!rewardAmount || rewardAmount === "0") {
        console.log(`Taskgrid: Task ${taskId} has invalid rewardAmount`)
        setError('Invalid task data')
        setLoading(false)
        return
      }

      const details = argsParsed.nextString()
      if (!details || details === "") {
        console.log(`Taskgrid: Task ${taskId} has invalid details`)
        setError('Invalid task data')
        setLoading(false)
        return
      }

                const subCount = Number(argsParsed.nextU32())
          const submissions: Submission[] = []
          
          console.log(`Taskgrid: Task ${taskId} has ${subCount} submissions`)
          for (let j = 0; j < subCount; j++) {
        const user = argsParsed.nextString()
        const submissionLink = argsParsed.nextString()
        
        if (user && submissionLink) {
          submissions.push({
            user,
            submissionLink
          })
        }
      }

      const isClosed = Number(argsParsed.nextU32()) === 1
      const winner = argsParsed.nextString()
      const status = isClosed ? "Closed" : (submissions.length >= 3 ? "Full" : "Open")

      const taskData: Task = {
        id: Number(taskId),
        creator,
        tokenGate,
        rewardToken,
        details,
        rewardAmount,
        submissions,
        isClosed,
        winner: winner !== '0x0000000000000000000000000000000000000000' ? winner : undefined,
        status,
        maxSubmissions: 3
      }

      console.log(`Taskgrid: Fetched task ${taskId}:`, taskData)
      setTask(taskData)
    } catch (error) {
      console.error(`Taskgrid: Error fetching task ${taskId}:`, error)
      setError('Failed to load task data')
    } finally {
      setLoading(false)
    }
  }, [isConnected, provider, taskId])

  // Parse task details from IPFS
  const parseTaskDetails = useCallback(async () => {
    if (!task?.details) {
      console.log("Taskgrid: No task details available")
      return
    }

    try {
      console.log("Taskgrid: Fetching task details from IPFS:", task.details)
      const data = await fetchIPFSData(task.details)
      console.log("Taskgrid: IPFS data fetched:", data)
      setTaskDetails({
        title: data.title || "Untitled Task",
        description: data.description || "No description provided",
        tokenSymbol: data.tokenSymbol
      })
    } catch (error) {
      console.error('Taskgrid: Error while fetching task details from IPFS:', error)
      // Fallback to parsing as JSON if IPFS fetch fails
      try {
        console.log("Taskgrid: Attempting to parse task details as JSON")
        const parsed = JSON.parse(task.details)
        setTaskDetails({
          title: parsed.title || "Untitled Task",
          description: parsed.description || "No description provided",
          tokenSymbol: parsed.tokenSymbol
        })
      } catch {
        console.log("Taskgrid: Using fallback task details")
        setTaskDetails({
          title: "Untitled Task",
          description: task.details || "No description provided"
        })
      }
    }
  }, [task?.details])

  useEffect(() => {
    console.log(`Taskgrid: useEffect triggered for task ${taskId}`)
    fetchTaskData()
  }, [fetchTaskData])

  useEffect(() => {
    console.log("Taskgrid: parseTaskDetails useEffect triggered")
    parseTaskDetails()
  }, [parseTaskDetails])

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
    console.log("Taskgrid: Loading state")
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading task...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !task) {
    console.log("Taskgrid: Error or no task state for task ID:", taskId)
    // Don't render anything for non-existent tasks to avoid cluttering the UI
    return null
  }

  console.log("Taskgrid: Rendering task:", task)

  return (
    <Card
      key={task.id}
      className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105"
    >
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{taskDetails?.title || `Task #${taskId}`}</CardTitle>
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
        <p className="text-gray-600 mb-4 line-clamp-3">{taskDetails?.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-green-600" />
            <span>{task.rewardAmount} tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{task.submissions.length}/{task.maxSubmissions}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/task/${taskId}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              View Details
            </Button>
          </Link>
          {task.winner && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Trophy className="w-3 h-3 mr-1" />
              Winner
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default Taskgrid