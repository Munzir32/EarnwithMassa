import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Coins, ArrowRight, Zap, Shield, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Powered by Web3</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Earn by Doing.
            <br />
            Compete by Submitting.
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the decentralized task marketplace where your skills earn you ERC-20 tokens. Token-gated access ensures
            quality submissions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/tasks">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full"
              >
                View Tasks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-200 hover:bg-purple-50 px-8 py-3 rounded-full"
              >
                Post a Task
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1,247</h3>
              <p className="text-gray-600">Tasks Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">3,891</h3>
              <p className="text-gray-600">Active Users</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">$127K</h3>
              <p className="text-gray-600">Rewards Distributed</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Tasks Preview */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Featured Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Design a Landing Page",
                token: "$ZORA",
                reward: "500",
                submissions: 2,
                status: "Open",
              },
              {
                title: "Build React Component",
                token: "$DEGEN",
                reward: "1000",
                submissions: 3,
                status: "Full",
              },
              {
                title: "Write Technical Blog",
                token: "$USDC",
                reward: "250",
                submissions: 1,
                status: "Open",
              },
            ].map((task, index) => (
              <Card
                key={index}
                className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge variant={task.status === "Open" ? "default" : "secondary"}>{task.status}</Badge>
                  </div>
                  <CardDescription>
                    Token Required: <span className="font-semibold text-purple-600">{task.token}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{task.reward} tokens</span>
                    </div>
                    <span className="text-sm text-gray-600">{task.submissions}/3 submissions</span>
                  </div>
                  <Button
                    className="w-full"
                    variant={task.status === "Full" ? "secondary" : "default"}
                    disabled={task.status === "Full"}
                  >
                    {task.status === "Full" ? "Submission Full" : "View Task"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose PlatformToEarn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Token Gated</h3>
              <p className="text-gray-600">Quality submissions ensured through token ownership requirements</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Limited Slots</h3>
              <p className="text-gray-600">Only 3 submissions per task to maintain exclusivity and quality</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ERC-20 Rewards</h3>
              <p className="text-gray-600">Earn real tokens for your contributions and skills</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
