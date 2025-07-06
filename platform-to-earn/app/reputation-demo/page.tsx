"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CreatorReputation from '@/components/CreatorReputation'

const sampleCreators = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    name: "Experienced Creator",
    description: "High success rate with excellent track record"
  },
  {
    address: "0x1234567890123456789012345678901234567890",
    name: "New Creator",
    description: "Building reputation with first few tasks"
  },
  {
    address: "0x9876543210987654321098765432109876543210",
    name: "Established Creator",
    description: "Consistent performer with good history"
  }
]

export default function ReputationDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Task Creator Reputation System</h1>
            <p className="text-lg text-gray-600 mb-6">
              Track task creator's history and success rate using Nodit's blockchain analytics
            </p>
          </div>

          {/* Features Overview */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Reputation System Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <h3 className="font-semibold mb-2">Success Rate Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor task completion rates and winner selection patterns</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">📊</span>
                  </div>
                  <h3 className="font-semibold mb-2">Transaction Analytics</h3>
                  <p className="text-sm text-gray-600">Analyze creator's blockchain activity and reward distribution</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">🏆</span>
                  </div>
                  <h3 className="font-semibold mb-2">Reputation Scoring</h3>
                  <p className="text-sm text-gray-600">Automatic reputation calculation based on performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Creator Reputations */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Sample Creator Reputations</h2>
            
            {sampleCreators.map((creator, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{creator.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-600">{creator.description}</p>
                </CardHeader>
                <CardContent>
                  <CreatorReputation creatorAddress={creator.address} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Info */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 mt-8">
            <CardHeader>
              <CardTitle>Integration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Nodit API Integration</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    The reputation system uses Nodit's blockchain analytics API to fetch transaction history and analyze creator behavior.
                  </p>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    GET /v1/ethereum/sepolia/blockchain/getTransactionsByAccount
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Smart Contract Integration</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Task data is fetched directly from the smart contract to calculate success rates and completion metrics.
                  </p>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    getTask(uint256 taskId) → Task data
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Reputation Calculation</h4>
                  <p className="text-sm text-gray-600">
                    Reputation is calculated based on total tasks, completion rate, average rewards, and transaction volume.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 