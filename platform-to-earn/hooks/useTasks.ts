import { useState, useEffect } from "react"
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3"
import { contract } from "@/contract"
import { useWallet } from "@/hooks/useWallet"
import { toast } from "@/hooks/use-toast"

export interface Submission {
  user: string
  submissionLink: string
}

export interface Task {
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

export function useTasks() {
  const { provider } = useWallet()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTaskData = async () => {
    if (!provider) {
      console.log("No provider available - wallet not connected")
      setIsFetching(false)
      setError("Wallet not connected. Please connect your wallet to view tasks.")
      return
    }

    try {
      setIsFetching(true)
      setError(null)
      console.log("Creating SmartContract instance...")

      const taskContract = new SmartContract(provider, contract)
      console.log("SmartContract created, getting task counter...")

      // Get total number of tasks
      const counterResult = await taskContract.read('taskCounter')
      const counterStr = bytesToStr(counterResult.value)
      const taskCounter = parseInt(counterStr)
      console.log("Total tasks:", taskCounter)

      const allTasks: Task[] = []

      // Loop through all tasks
      console.log("Starting loop, total tasks:", taskCounter)
      for (let i = 0; i < taskCounter; i++) {
        console.log(`Processing task ${i}/${taskCounter}`)
        try {
          const args = new Args().addU64(BigInt(i))
          console.log(`Fetching task ${i}...`)
          const result = await taskContract.read('getTask', args)
          const data = result.value

          if (!data || data.length === 0) {
            console.log(`Task ${i} is empty, skipping...`)
            continue
          }

          // Parse the returned data
          const argsParsed = new Args(data)
          console.log(argsParsed, "task data")

          // Check if the task data is valid (not empty)
          if (argsParsed.serialized.length === 0) {
            console.log(`Task ${i} has no data, skipping...`)
            continue
          }

          const creator = argsParsed.nextString()
          if (!creator || creator === "") {
            console.log(`Task ${i} has invalid creator, skipping...`)
            continue
          }

          const tokenGate = argsParsed.nextString()
          if (!tokenGate || tokenGate === "") {
            console.log(`Task ${i} has invalid tokenGate, skipping...`)
            continue
          }

          const rewardToken = argsParsed.nextString()
          if (!rewardToken || rewardToken === "") {
            console.log(`Task ${i} has invalid rewardToken, skipping...`)
            continue
          }

          const rewardAmount = argsParsed.nextU64().toString()
          if (!rewardAmount || rewardAmount === "0") {
            console.log(`Task ${i} has invalid rewardAmount, skipping...`)
            continue
          }

          const details = argsParsed.nextString()
          if (!details || details === "") {
            console.log(`Task ${i} has invalid details, skipping...`)
            continue
          }

          const subCount = Number(argsParsed.nextU32())
          const submissions: Submission[] = []
          
          console.log(`Task ${i} has ${subCount} submissions`)
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

          const task: Task = {
            id: i,
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
          console.log(`Fetched task ${i}:`, task)
          allTasks.push(task)
        } catch (err) {
          console.error(`Error fetching task ${i}:`, err)
          // Continue with next task even if one fails
        }
      }

      setTasks(allTasks)
      console.log("All tasks fetched:", allTasks)
    } catch (error) {
      console.error("Error fetching task data:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to Fetch Tasks",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchTaskData()
  }, [provider])

  return {
    tasks,
    isFetching,
    error,
    refetch: fetchTaskData
  }
} 