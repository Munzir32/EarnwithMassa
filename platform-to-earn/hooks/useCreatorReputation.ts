import { useState, useEffect, useCallback } from 'react'
import { useReadContract } from 'wagmi'
import { contract } from '@/contract'
import ABI from '@/contract/ABI.json'

export interface CreatorStats {
  totalTasks: number
  completedTasks: number
  totalRewardsDistributed: string
  averageReward: string
  successRate: number
  lastActivity: string
  reputation: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown'
  transactionCount: number
  totalVolume: string
}

export interface NoditTransactionResponse {
  rpp: number
  items: Array<{
    hash: string
    from: string
    to: string
    value: string
    timestamp: string
    status: string
    method: string
  }>
}

export const useCreatorReputation = (creatorAddress: string) => {
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get task counter to iterate through all tasks
  const { data: taskCounter } = useReadContract({
    address: contract as `0x${string}`,
    abi: ABI,
    functionName: 'taskCounter',
  })

  const getCreatorStats = useCallback(async (creatorAddress: string) => {
    if (!creatorAddress || !taskCounter) return null

    setLoading(true)
    setError(null)

    try {
      // Get creator's transaction history from Nodit
      const apiKey = process.env.NEXT_PUBLIC_NODIT_API_KEY || 'nodit-demo'
      
      const response = await fetch('https://web3.nodit.io/v1/ethereum/sepolia/blockchain/getTransactionsByAccount', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          accountAddress: creatorAddress,
          contractAddress: contract,
          withCount: false
        })
      })

      let transactionData: NoditTransactionResponse | null = null
      
      if (response.ok) {
        transactionData = await response.json()
      } else {
        console.warn('Nodit API error:', response.status, response.statusText)
        // Continue with contract-only data
      }

      // Fetch all tasks to analyze creator's history
      const creatorTasks = []
      let totalRewards = BigInt(0)
      let completedTasks = 0
      let lastActivity = ''

      for (let i = 0; i < Number(taskCounter); i++) {
        try {
          const taskData = await fetch(`/api/task/${i}`).then(res => res.json())
          if (taskData.creator?.toLowerCase() === creatorAddress.toLowerCase()) {
            creatorTasks.push(taskData)
            totalRewards += BigInt(taskData.rewardAmount || 0)
            
            if (taskData.isClosed) {
              completedTasks++
            }

            // Track last activity (simplified - in real implementation you'd get timestamps)
            if (!lastActivity) {
              lastActivity = 'Recent'
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch task ${i}:`, err)
        }
      }

      const totalTasks = creatorTasks.length
      const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      const averageReward = totalTasks > 0 ? (totalRewards / BigInt(totalTasks)).toString() : '0'

      // Calculate reputation score
      let reputation: CreatorStats['reputation'] = 'Unknown'
      if (totalTasks >= 5) {
        if (successRate >= 90) reputation = 'Excellent'
        else if (successRate >= 75) reputation = 'Good'
        else if (successRate >= 50) reputation = 'Fair'
        else reputation = 'Poor'
      } else if (totalTasks > 0) {
        reputation = 'Fair' // New creators start with fair reputation
      }

      // Calculate transaction volume from Nodit data
      let totalVolume = BigInt(0)
      let transactionCount = 0
      
      if (transactionData?.items) {
        transactionCount = transactionData.items.length
        totalVolume = transactionData.items.reduce((acc, tx) => {
          return acc + BigInt(tx.value || 0)
        }, BigInt(0))
      }

      const creatorStats: CreatorStats = {
        totalTasks,
        completedTasks,
        totalRewardsDistributed: totalRewards.toString(),
        averageReward,
        successRate: Math.round(successRate),
        lastActivity,
        reputation,
        transactionCount,
        totalVolume: totalVolume.toString()
      }

      setStats(creatorStats)
      return creatorStats

    } catch (err) {
      console.error('Error fetching creator stats:', err)
      setError('Failed to fetch creator statistics')
      return null
    } finally {
      setLoading(false)
    }
  }, [taskCounter])

  useEffect(() => {
    if (creatorAddress && taskCounter) {
      getCreatorStats(creatorAddress)
    }
  }, [creatorAddress, taskCounter, getCreatorStats])

  return {
    stats,
    loading,
    error,
    refetch: () => getCreatorStats(creatorAddress)
  }
} 