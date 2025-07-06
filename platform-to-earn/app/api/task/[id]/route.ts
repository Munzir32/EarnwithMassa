import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia } from 'viem/chains'
import { contract } from '@/contract'
import ABI from '@/contract/ABI.json'

const client = createPublicClient({
  chain: sepolia,
  transport: http()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id)
    
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    // Fetch task data from smart contract
    const taskData = await client.readContract({
      address: contract as `0x${string}`,
      abi: ABI,
      functionName: 'getTask',
      args: [BigInt(taskId)]
    })

    if (!taskData) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const [creator, tokenGate, rewardToken, details, rewardAmount, submissions, isClosed, winner] = taskData as any

    const task = {
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

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task data' }, 
      { status: 500 }
    )
  }
} 