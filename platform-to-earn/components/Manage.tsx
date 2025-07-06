'use client'
import React from 'react'
import { useState, useEffect, useMemo, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/useWallet"
import { contract } from "@/contract"
import { SmartContract, Args } from "@massalabs/massa-web3"
import TaskCard from '@/components/TaskCard'

interface Submission {
    user: string
    submissionLink: string
}



const Manage = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [taskIds, setTaskIds] = useState<Map<string, string>>(new Map())
    const [taskCounter, setTaskCounter] = useState<bigint>(BigInt(0))

    const { isConnected, provider } = useWallet()


    const fetchTaskCounter = useCallback(async () => {
        if (!isConnected || !provider) {
            return
        }

        try {
            const taskContract = new SmartContract(provider, contract)
            
            // Add timeout to the contract call
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
            })
            
            const resultPromise = taskContract.read('taskCounter')
            const result = await Promise.race([resultPromise, timeoutPromise]) as any
            
            const counter = BigInt(result.value.toString())
            setTaskCounter(counter)
            
            const newMap = new Map<string, string>()
            if (counter > 0) {
                for (let i = 0; i < counter; i++) {
                    newMap.set(i.toString(), i.toString())
                }
                setTaskIds(newMap)
            }
        } catch (error) {
            console.error("Error fetching task counter:", error)
            // Set default values to prevent infinite loading
            setTaskCounter(BigInt(0))
            setTaskIds(new Map())
        }
    }, [isConnected, provider])

    const getTaskIds = useCallback(() => {
        try {
            if (!taskCounter || taskCounter === BigInt(0)) {
                return
            }

            const newMap = new Map<string, string>()
            if (typeof taskCounter === 'bigint' && taskCounter > 0) {
                for (let i = 0; i < taskCounter; i++) {
                    newMap.set(i.toString(), i.toString())
                }
                setTaskIds(new Map(newMap))
            }
        } catch (error) {
            console.error("Error setting task IDs:", error)
        }
    }, [taskCounter])

    useEffect(() => {
        fetchTaskCounter()
    }, [fetchTaskCounter])

    useEffect(() => {
        getTaskIds()
    }, [taskCounter, getTaskIds])

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchTaskCounter()
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
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <div className="w-5 h-5 text-yellow-400">⚠️</div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Demo Mode:</strong> Showing sample tasks due to network timeout. 
                                    The app is working with mock data for demonstration purposes.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-lg mb-4">No tasks found on blockchain.</p>
                    <p className="text-sm text-gray-500">Try refreshing or check your network connection.</p>
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