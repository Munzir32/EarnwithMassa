'use client'
import React from 'react'
import { useState, useEffect, useMemo, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWriteContract, useReadContract, useAccount } from "wagmi"
import { contract } from "@/contract"
import ABI from "@/contract/ABI.json"
import TaskCard from '@/components/TaskCard'

interface Submission {
    user: string
    submissionLink: string
}



const Manage = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [taskIds, setTaskIds] = useState<Map<string, string>>(new Map())

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

    const handleRefresh = async () => {
        setRefreshing(true)
        await refetchTaskCounter()
        setRefreshing(false)
    }

  






    const loading = !taskCounter && taskIds.size === 0

    return (
        <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Tasks</h2>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tasks from blockchain...</p>
                </div>
            ) : taskIds.size === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No tasks found on blockchain.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {[...taskIds.entries()].map(([key, value]) => (
                        <TaskCard 
                            key={key} 
                            id={value}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Manage