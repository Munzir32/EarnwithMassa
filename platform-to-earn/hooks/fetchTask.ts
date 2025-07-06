import { useReadContract } from "wagmi"
import { contract } from "@/contract"
import ABI from "@/contract/ABI.json"

export const useFetchTask = (taskId: number) => {
    const { data, isLoading, error } = useReadContract({
        address: contract as `0x${string}`,
        abi: ABI,
        functionName: 'getTask',
        args: [BigInt(taskId)],
    })

    if (isLoading || error || !data) {
        return null
    }

    const [creator, tokenGate, rewardToken, details, rewardAmount, submissions, isClosed, winner] = data as any
    
    return {
        id: taskId,
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
    }
}

// Custom hook to fetch all tasks up to a maximum count
export const useFetchAllTasks = (maxTasks: number = 10) => {
    const tasks = []
    
    // Create individual hooks for each possible task ID
    for (let i = 0; i < maxTasks; i++) {
        const task = useFetchTask(i)
        if (task) {
            tasks.push(task)
        }
    }
    
    return tasks
}