'use client'

import { useState } from 'react'

interface Candidate {
  id: number;
  name: string;
  votes: number;
  percentage: number;
  isBetPlaced?: boolean; // Kullanıcının bahis yapıp yapmadığını kontrol etmek için
}

export default function Results() {
  const [activeCommittee, setActiveCommittee] = useState(1)

  const committees = [
    {
      id: 1,
      name: "DELEGASYON",
      totalVotes: 150,
      winner: {
        id: 1,
        name: "Mauro Icardi",
        votes: 45,
        percentage: 30,
        isBetPlaced: true // Örnek olarak bahis yapılmış
      }
    },
    {
      id: 2,
      name: "TASARIM",
      totalVotes: 120,
      winner: {
        id: 5,
        name: "Mauro Icardi",
        votes: 40,
        percentage: 33.33,
        isBetPlaced: false
      }
    },
    // ... diğer komiteler benzer şekilde
  ]

  return (
    <div className="min-h-screen bg-[#001F1F] p-8">
      {/* Committee Tabs */}
      <div className="mb-8">
        <div className="border-b border-[#2A4444]">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {committees.map((committee) => (
              <button
                key={committee.id}
                onClick={() => setActiveCommittee(committee.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeCommittee === committee.id 
                    ? 'border-primary-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                `}
              >
                {committee.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Results Display */}
      {committees.map((committee) => (
        committee.id === activeCommittee && (
          <div key={committee.id} className="bg-[#1A3333] rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-white text-2xl font-medium mb-2">{committee.name}</h2>
              <p className="text-[#4A6464]">Toplam Oy: {committee.totalVotes}</p>
            </div>

            {/* Winner Section */}
            <div className="bg-[#2A4444] rounded-lg p-6">
              <h3 className="text-white text-xl font-medium mb-4">Kazanan</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg">{committee.winner.name}</span>
                  <span className="text-primary-500">%{committee.winner.percentage}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#1A3333] rounded-full h-3">
                  <div 
                    className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${committee.winner.percentage}%` }}
                  ></div>
                </div>

                {/* Bet Result Message */}
                {committee.winner.isBetPlaced && (
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-center font-medium">
                      🎉 Tebrikler! Bahis yaptığınız aday kazandı!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  )
} 