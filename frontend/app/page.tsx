'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Jackocracy
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ITU Blockchain Democratic Election Platform
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* Vote Card */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4 text-primary-600">Vote</h2>
          <p className="text-gray-600 mb-6">
            Cast your vote in active elections and make your voice heard
          </p>
          <button 
            onClick={() => router.push('/vote')}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition"
          >
            Vote Now
          </button>
        </div>

        {/* Jackpot Card */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4 text-primary-600">Jackpot</h2>
          <p className="text-gray-600 mb-6">
            Try your luck in the classic jackpot game and win big
          </p>
          <button 
            onClick={() => router.push('/jackpot')}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition"
          >
            Play Jackpot
          </button>
        </div>

        {/* Coin Flip Card */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4 text-primary-600">Coin Flip</h2>
          <p className="text-gray-600 mb-6">
            Simple heads or tails game with instant rewards
          </p>
          <button 
            onClick={() => router.push('/flip')}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition"
          >
            Play Coin Flip
          </button>
        </div>
      </div>
    </div>
  )
}
