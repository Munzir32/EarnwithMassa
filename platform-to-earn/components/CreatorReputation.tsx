import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react'
import { useCreatorReputation, CreatorStats } from '@/hooks/useCreatorReputation'

interface CreatorReputationProps {
  creatorAddress: string
  className?: string
}

const getReputationColor = (reputation: CreatorStats['reputation']) => {
  switch (reputation) {
    case 'Excellent':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
    case 'Good':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
    case 'Fair':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
    case 'Poor':
      return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getReputationIcon = (reputation: CreatorStats['reputation']) => {
  switch (reputation) {
    case 'Excellent':
      return <Trophy className="w-4 h-4" />
    case 'Good':
      return <Award className="w-4 h-4" />
    case 'Fair':
      return <TrendingUp className="w-4 h-4" />
    case 'Poor':
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatNumber = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num) : num
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

const CreatorReputation: React.FC<CreatorReputationProps> = ({ 
  creatorAddress, 
  className = "" 
}) => {
  const { stats, loading, error } = useCreatorReputation(creatorAddress)

  if (loading) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm border-white/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm border-white/20 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span>Unable to load creator reputation</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white/60 backdrop-blur-sm border-white/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">Creator Reputation</span>
          <Badge className={getReputationColor(stats.reputation)}>
            <div className="flex items-center gap-1">
              {getReputationIcon(stats.reputation)}
              {stats.reputation}
            </div>
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {formatAddress(creatorAddress)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Success Rate</span>
            <span className="text-gray-600">{stats.successRate}%</span>
          </div>
          <Progress value={stats.successRate} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/40 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalTasks}
            </div>
            <div className="text-xs text-gray-500">
              {stats.completedTasks} completed
            </div>
          </div>

          <div className="bg-white/40 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Avg Reward</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.averageReward)}
            </div>
            <div className="text-xs text-gray-500">
              tokens per task
            </div>
          </div>

          <div className="bg-white/40 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Transactions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.transactionCount)}
            </div>
            <div className="text-xs text-gray-500">
              total volume: {formatNumber(stats.totalVolume)}
            </div>
          </div>

          <div className="bg-white/40 rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Last Activity</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.lastActivity}
            </div>
            <div className="text-xs text-gray-500">
              {stats.totalRewardsDistributed} total distributed
            </div>
          </div>
        </div>

        {/* Reputation Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-gray-900 mb-2">Reputation Insights</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {stats.reputation === 'Excellent' && (
              <p>🌟 This creator has an outstanding track record with high completion rates and consistent rewards.</p>
            )}
            {stats.reputation === 'Good' && (
              <p>✅ This creator has a solid history of successful task completion and fair reward distribution.</p>
            )}
            {stats.reputation === 'Fair' && (
              <p>⚠️ This creator is building their reputation. Consider their recent activity when evaluating tasks.</p>
            )}
            {stats.reputation === 'Poor' && (
              <p>🚨 This creator has a low success rate. Exercise caution when participating in their tasks.</p>
            )}
            {stats.reputation === 'Unknown' && (
              <p>❓ This creator is new to the platform. No reputation data available yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CreatorReputation 