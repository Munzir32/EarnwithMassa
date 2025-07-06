"use client"

import { useTasks } from '@/hooks/useTasks'
import { useWallet } from '@/hooks/useWallet'

export default function TestTasksPage() {
  const { provider, isConnected } = useWallet()
  const { tasks, isFetching, error, refetch } = useTasks()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Tasks Page</h1>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Wallet Status</h2>
            <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Provider: {provider ? 'Available' : 'Not Available'}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Tasks Status</h2>
            <p>Fetching: {isFetching ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Tasks Count: {tasks.length}</p>
            {!isConnected && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Wallet not connected. Connect your wallet to view tasks.
                </p>
              </div>
            )}
            <button 
              onClick={refetch}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
            >
              Refetch Tasks
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Tasks Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(tasks, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 