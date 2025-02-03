'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Bet {
  committeeId: number;
  committeeName: string;
  candidateName: string;
  amount: string;
}

export default function Vote() {
  const router = useRouter()
  const [selectedCandidates, setSelectedCandidates] = useState<{ [key: number]: number }>({})
  const [betAmounts, setBetAmounts] = useState<{ [key: number]: string }>({})
  const [userBets, setUserBets] = useState<Bet[]>([])

  const committees = [
    {
      id: 1,
      name: "DELEGASYON",
      candidates: [
        { id: 1, name: "Mauro Icardi" },
        { id: 2, name: "Ahmet Yılmaz" },
        { id: 3, name: "Mehmet Demir" },
        { id: 4, name: "Ali Yıldız" }
      ]
    },
    {
      id: 2,
      name: "TASARIM",
      candidates: [
        { id: 5, name: "Mauro Icardi" },
        { id: 6, name: "Aday 2" },
        { id: 7, name: "Aday 3" },
        { id: 8, name: "Aday 4" }
      ]
    },
    {
      id: 3,
      name: "GELİŞTİRME",
      candidates: [
        { id: 9, name: "Mauro Icardi" },
        { id: 10, name: "Oy ver" },
        { id: 11, name: "Bahis" }
      ]
    },
    {
      id: 4,
      name: "MARKETING",
      candidates: [
        { id: 12, name: "Mauro Icardi" },
        { id: 13, name: "Oy ver" },
        { id: 14, name: "Bahis" }
      ]
    },
    {
      id: 5,
      name: "ARAŞTIRMA",
      candidates: [
        { id: 15, name: "Mauro Icardi" },
        { id: 16, name: "Oy ver" },
        { id: 17, name: "Bahis" }
      ]
    },
    {
      id: 6,
      name: "EĞİTİM VE İÇERİK",
      candidates: [
        { id: 18, name: "Mauro Icardi" },
        { id: 19, name: "Oy ver" },
        { id: 20, name: "Bahis" }
      ]
    }
  ]

  const handleCandidateSelect = (committeeId: number, candidateId: number) => {
    setSelectedCandidates({
      ...selectedCandidates,
      [committeeId]: candidateId
    })
  }

  const handleBetAmountChange = (committeeId: number, value: string) => {
    setBetAmounts({
      ...betAmounts,
      [committeeId]: value
    })
  }

  const handleBet = (committeeId: number) => {
    const committee = committees.find(c => c.id === committeeId)
    const selectedCandidateId = selectedCandidates[committeeId]
    const amount = betAmounts[committeeId]

    if (!committee || !selectedCandidateId || !amount) return

    const candidate = committee.candidates.find(c => c.id === selectedCandidateId)
    if (!candidate) return

    const newBet: Bet = {
      committeeId,
      committeeName: committee.name,
      candidateName: candidate.name,
      amount
    }

    setUserBets(prev => [...prev, newBet])
    setBetAmounts(prev => ({ ...prev, [committeeId]: '' }))
  }

  return (
    <div className="min-h-screen bg-[#001F1F] p-8 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {committees.map((committee) => (
          <div key={committee.id} className="bg-[#1A3333] rounded-lg p-6 shadow-lg">
            <h2 className="text-white text-xl font-medium mb-4 text-center border border-[#2A4444] rounded-md py-2">
              {committee.name}
            </h2>
            
            {/* Dropdown Selection */}
            <div className="mb-4">
              <select
                value={selectedCandidates[committee.id] || ''}
                onChange={(e) => handleCandidateSelect(committee.id, Number(e.target.value))}
                className="w-full p-2 bg-[#2A4444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Aday Seçiniz</option>
                {committee.candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vote and Bet Section */}
            <div className="space-y-2">
              <button 
                className="w-full text-white text-center p-2 bg-[#2A4444] rounded-md hover:bg-[#3A5454] transition"
                onClick={() => console.log(`Voted for ${selectedCandidates[committee.id]} in ${committee.name}`)}
              >
                Oy ver
              </button>
              
              <div className="space-y-2">
                <button 
                  className="w-full text-white text-center p-2 bg-[#2A4444] rounded-md hover:bg-[#3A5454] transition"
                  onClick={() => handleBet(committee.id)}
                >
                  Bahis
                </button>
                <input
                  type="number"
                  placeholder="Bahis miktarı..."
                  value={betAmounts[committee.id] || ''}
                  onChange={(e) => handleBetAmountChange(committee.id, e.target.value)}
                  className="w-full p-2 bg-[#2A4444] text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="text-[#4A6464] text-sm text-center mt-4">
              Seçime hakkında kısa kısa bilgiler...
            </div>
          </div>
        ))}
      </div>

      {/* Results Button */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => router.push('/results')}
          className="bg-[#1A3333] text-white px-8 py-3 rounded-md hover:bg-[#2A4444] transition"
        >
          SEÇİM SONUÇLARINI GÖR
        </button>
      </div>

      {/* Your Bets Section - Güncellenen stil */}
      {userBets.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-[#1A3333] p-4 rounded-lg shadow-lg min-w-[250px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-medium">Your Bets</h3>
            <span className="text-[#4A6464] text-sm">
              {userBets.length} bet{userBets.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {userBets.map((bet, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center bg-[#2A4444] p-2 rounded"
              >
                <div className="text-white text-sm">
                  <div>{bet.candidateName}</div>
                  <div className="text-[#4A6464] text-xs">{bet.committeeName}</div>
                </div>
                <div className="text-primary-500 font-medium">
                  {bet.amount}$
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#2A4444]">
            <div className="flex justify-between text-sm">
              <span className="text-[#4A6464]">Total Bet Amount:</span>
              <span className="text-primary-500 font-medium">
                {userBets.reduce((sum, bet) => sum + Number(bet.amount), 0)}$
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 