'use client'

import { useState } from 'react'

export default function Jackpot() {
  const [betAmount, setBetAmount] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)

  const currentJackpot = 1500 // Örnek jackpot miktarı
  const lastWinner = {
    address: "0x1234...5678",
    amount: 1200
  }

  const handleSpin = () => {
    if (!betAmount) return
    
    setIsSpinning(true)
    // Simüle edilmiş spin animasyonu
    setTimeout(() => {
      setIsSpinning(false)
      setBetAmount('')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#001F1F] p-8">
      {/* Jackpot Amount Display */}
      <div className="bg-[#1A3333] rounded-lg p-8 mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Current Jackpot</h1>
        <div className="text-5xl font-bold text-primary-500 mb-4">
          ${currentJackpot}
        </div>
        <p className="text-[#4A6464]">
          Place your bet and try your luck!
        </p>
      </div>

      {/* Betting Section */}
      <div className="bg-[#1A3333] rounded-lg p-8 mb-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          {/* Bet Amount Input */}
          <div className="space-y-2">
            <label className="block text-white">Bet Amount</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter amount..."
              className="w-full p-3 bg-[#2A4444] text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || !betAmount}
            className={`
              w-full py-4 rounded-md text-white font-medium
              ${isSpinning 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-primary-500 hover:bg-primary-600'}
              transition-all duration-300
            `}
          >
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </button>
        </div>
      </div>

      {/* Last Winner Section */}
      <div className="bg-[#1A3333] rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-white text-xl font-medium mb-4">Last Winner</h2>
        <div className="flex justify-between items-center">
          <div className="text-[#4A6464]">
            Address: {lastWinner.address}
          </div>
          <div className="text-primary-500 font-medium">
            ${lastWinner.amount}
          </div>
        </div>
      </div>

      {/* Rules Section */}
      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-white text-xl font-medium mb-4">How to Play</h2>
        <div className="bg-[#1A3333] rounded-lg p-6">
          <ul className="space-y-2 text-[#4A6464]">
            <li>1. Enter your bet amount</li>
            <li>2. Click SPIN button</li>
            <li>3. If you're lucky, you'll win the jackpot!</li>
            <li>4. 10% of each bet goes to the jackpot pool</li>
            <li>5. Minimum bet: $10</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 