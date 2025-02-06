'use client'

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/providers/Web3Provider';
import { CONTRACT_ADDRESSES, ABIS } from '@/config/contracts';

type CategoryType = 'delegation' | 'developer' | 'designer' | 'researcher' | 'marketing' | 'education';

interface Category {
  id: CategoryType;
  name: string;
  description: string;
  voteFunction: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'delegation',
    name: 'Delegasyon',
    description: 'ITU Blockchain Delegasyon seçimi',
    voteFunction: 'voteForDelegation'
  },
  {
    id: 'developer',
    name: 'Geliştirici',
    description: 'ITU Blockchain Geliştirici seçimi',
    voteFunction: 'voteForDeveloper'
  },
  {
    id: 'designer',
    name: 'Tasarım',
    description: 'ITU Blockchain Tasarım seçimi',
    voteFunction: 'voteForDesigner'
  },
  {
    id: 'researcher',
    name: 'Araştırma',
    description: 'ITU Blockchain Araştırma seçimi',
    voteFunction: 'voteForResearcher'
  },
  {
    id: 'marketing',
    name: 'Pazarlama',
    description: 'ITU Blockchain Pazarlama seçimi',
    voteFunction: 'voteForMarketing'
  },
  {
    id: 'education',
    name: 'Eğitim',
    description: 'ITU Blockchain Eğitim seçimi',
    voteFunction: 'voteForEducation'
  }
];

// Aday adreslerini isimlere eşleyen obje
const CANDIDATE_NAMES: { [key: string]: string } = {
  "0x1234...": "Ahmet Yılmaz - Blockchain Developer",
  "0x2345...": "Mehmet Demir - UI/UX Designer",
  "0x3456...": "Ayşe Kaya - Research Lead",
  // Diğer adaylar...
};

export default function Election() {
  const { provider, address } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [newCandidate, setNewCandidate] = useState('');
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<CategoryType | ''>('');
  const [betAmount, setBetAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'vote' | 'bet'>('vote');
  const [candidates, setCandidates] = useState<Record<CategoryType, string[]>>({
    delegation: [ethers.constants.AddressZero],
    developer: [ethers.constants.AddressZero],
    designer: [ethers.constants.AddressZero],
    researcher: [ethers.constants.AddressZero],
    marketing: [ethers.constants.AddressZero],
    education: [ethers.constants.AddressZero]
  });

  const [votes, setVotes] = useState<Record<CategoryType, number[]>>({
    delegation: [],
    developer: [],
    designer: [],
    researcher: [],
    marketing: [],
    education: []
  });

  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    if (provider && address) {
      checkOwner();
      checkApplicationStatus();
      loadCandidatesAndVotes();
    }
  }, [provider, address]);

  const checkOwner = async () => {
    if (!provider || !address) return;

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        provider
      );

      const owners = await contract.owners(0); // İlk owner'ı kontrol et
      setIsOwner(owners.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error checking owner:", error);
    }
  };

  const checkApplicationStatus = async () => {
    if (!provider) return;

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        provider
      );

      const status = await contract.isApplicationOpen();
      setIsApplicationOpen(status);
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const addCandidate = async () => {
    if (!provider || !selectedCategoryForAdd || !newCandidate) return;

    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        signer
      );

      const addFunction = `add${selectedCategoryForAdd.charAt(0).toUpperCase() + selectedCategoryForAdd.slice(1)}Candidate`;
      
      console.log(`Adding candidate ${newCandidate} to ${selectedCategoryForAdd}...`);
      const tx = await contract[addFunction](newCandidate);
      
      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      
      console.log("Candidate added!");
      alert("Aday başarıyla eklendi!");
      
      setNewCandidate('');
      setSelectedCategoryForAdd('');
      
      // Refresh candidates
      await loadCandidatesAndVotes();
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCandidates = async (category: CategoryType): Promise<string[]> => {
    if (!provider) return [];
    
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        provider
      );

      const getCandidatesFunction = `get${category.charAt(0).toUpperCase() + category.slice(1)}Candidates`;
      console.log(`Getting candidates using ${getCandidatesFunction}`);
      return await contract[getCandidatesFunction]();
    } catch (error) {
      console.error(`Error getting candidates for ${category}:`, error);
      return [];
    }
  };

  const getVotes = async (category: CategoryType): Promise<number[]> => {
    if (!provider) return [];
    
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        provider
      );

      const getVotesFunction = `get${category.charAt(0).toUpperCase() + category.slice(1)}Votes`;
      console.log(`Getting votes using ${getVotesFunction}`);
      const votes = await contract[getVotesFunction]();
      return votes.map((vote: ethers.BigNumber) => vote.toNumber());
    } catch (error) {
      console.error(`Error getting votes for ${category}:`, error);
      return [];
    }
  };

  const loadCandidatesAndVotes = async () => {
    if (!provider) return;

    try {
      const newCandidates: Record<CategoryType, string[]> = {
        delegation: [],
        developer: [],
        designer: [],
        researcher: [],
        marketing: [],
        education: []
      };

      const newVotes: Record<CategoryType, number[]> = {
        delegation: [],
        developer: [],
        designer: [],
        researcher: [],
        marketing: [],
        education: []
      };

      // Her kategori için adayları ve oyları yükle
      for (const category of CATEGORIES) {
        newCandidates[category.id] = await getCandidates(category.id);
        newVotes[category.id] = await getVotes(category.id);
      }

      setCandidates(newCandidates);
      setVotes(newVotes);
    } catch (error) {
      console.error("Error loading candidates and votes:", error);
    }
  };

  const vote = async (category: CategoryType, candidateAddress: string) => {
    if (!provider || !address) {
      alert("Lütfen cüzdanınızı bağlayın!");
      return;
    }

    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        signer
      );

      const voteFunction = `voteFor${category.charAt(0).toUpperCase() + category.slice(1)}`;
      console.log(`Voting for ${candidateAddress} in ${category} category using ${voteFunction}`);

      const tx = await contract[voteFunction](candidateAddress);
      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      
      console.log("Vote confirmed!");
      alert("Oyunuz başarıyla kaydedildi!");
      
      await loadCandidatesAndVotes();
    } catch (error: any) {
      console.error("Voting error:", error);
      
      // Hata mesajlarını daha anlaşılır hale getir
      if (error.message.includes("Candidate applying is not on")) {
        alert("Hata: Şu anda aday başvuru süreci kapalıdır.");
      } else if (error.message.includes("already voted")) {
        alert("Hata: Bu kategoride zaten oy kullanmışsınız.");
      } else if (error.message.includes("not a candidate")) {
        alert("Hata: Seçilen adres bir aday değil.");
      } else {
        alert(`Hata: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (category: CategoryType, candidateAddress: string) => {
    if (!provider || !betAmount) {
      alert("Lütfen bahis miktarı girin!");
      return;
    }

    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION_PREDICT,
        ABIS.ELECTION_PREDICT,
        signer
      );

      const amountWei = ethers.utils.parseEther(betAmount);
      
      let tx;
      if (category === 'delegation') {
        // Delegation uses tokens
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.ELECTION,
          ABIS.ELECTION,
          signer
        );

        
        // Approve tokens first
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.ELECTION_PREDICT, amountWei);
        await approveTx.wait();
        
        tx = await contract[`betFor${category.charAt(0).toUpperCase() + category.slice(1)}`](candidateAddress, amountWei);
      } else {
        // Others use native currency (ETH)
        tx = await contract[`betFor${category.charAt(0).toUpperCase() + category.slice(1)}`](candidateAddress, {
          value: amountWei
        });
      }

      await tx.wait();
      alert("Bahis başarıyla yerleştirildi!");
      setBetAmount('');
    } catch (error: any) {
      console.error("Bahis hatası:", error);
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Adres için isim döndüren yardımcı fonksiyon
  const getCandidateName = (address: string) => {
    return CANDIDATE_NAMES[address.toLowerCase()] || address;
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        alert('Adres kopyalandı!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Adres kopyalandı!');
        } catch (err) {
          console.error('Kopyalama başarısız:', err);
        }
        textArea.remove();
      }
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      alert('Adresi kopyalarken bir hata oluştu');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-4 text-center">ITU BLOCKCHAIN BOARD SEÇİMLERİ</h1>
      
      {/* Bağlantı Durumu */}
      {!address ? (
        <div className="text-center mb-8 p-6 bg-yellow-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">👋 Hoş Geldiniz!</h2>
          <p className="text-yellow-800 mb-4">
            Oy kullanmak veya bahis yapmak için cüzdanınızı bağlamanız gerekiyor.
          </p>
          <p className="text-sm text-yellow-700">
            Sağ üst köşedeki "Cüzdan Bağla" butonunu kullanabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="text-center mb-8 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">
            🎉 Bağlantı başarılı! Şimdi oy kullanabilir veya bahis yapabilirsiniz.
          </p>
        </div>
      )}

      {/* Aday Başvuru Durumu */}
      {!isApplicationOpen && (
        <div className="text-center mb-8 p-4 bg-yellow-100 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ Aday başvuru süreci şu anda kapalıdır. Oy verme işlemi yapılamaz.
          </p>
        </div>
      )}

      {/* Owner Panel */}
      {isOwner && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">🔑 Yönetici Paneli</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategoryForAdd}
                onChange={(e) => setSelectedCategoryForAdd(e.target.value as CategoryType)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kategori Seçin</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newCandidate}
                onChange={(e) => setNewCandidate(e.target.value)}
                placeholder="Aday Cüzdan Adresi"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addCandidate}
                disabled={loading || !selectedCategoryForAdd || !newCandidate}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Ekleniyor...' : '➕ Aday Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İşlem Seçimi */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-white p-2 rounded-lg shadow-md inline-flex space-x-1">
          <button
            onClick={() => setActiveTab('vote')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'vote'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🗳️ Oy Ver
          </button>
          <button
            onClick={() => setActiveTab('bet')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'bet'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎲 Bahis Yap
          </button>
        </div>

        {/* Bahis Miktarı Girişi */}
        {activeTab === 'bet' && (
          <div className="mt-6 w-full max-w-md">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bahis Miktarı
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 border rounded-lg pr-16 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {selectedCategoryForAdd === 'delegation' ? 'TOKEN' : 'ETH'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kategoriler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600 mb-4">{category.description}</p>

              <div className="space-y-4">
                {candidates[category.id].map((candidate, index) => (
                  <div key={candidate} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col space-y-2">
                      {/* Aday İsmi */}
                      <span className="text-lg font-medium text-gray-900">
                        {getCandidateName(candidate)}
                      </span>
                      
                      {/* Aday Adresi */}
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded text-gray-600">
                          {candidate}
                        </span>
                        <button
                          onClick={() => copyToClipboard(candidate)}
                          className="text-blue-600 hover:text-blue-800 text-sm p-1 hover:bg-blue-50 rounded"
                        >
                          📋
                        </button>
                      </div>

                      {/* Oy Sayısı */}
                      <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-flex items-center w-fit">
                        <span className="mr-1">🗳️</span>
                        {votes[category.id][index] || 0} Oy
                      </span>

                      {/* Oy Verme / Bahis Butonu */}
                      {activeTab === 'vote' ? (
                        <button
                          onClick={() => vote(category.id, candidate)}
                          disabled={loading || !address || !isApplicationOpen}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? '⏳ İşlem Yapılıyor...' : 
                           !isApplicationOpen ? '🔒 Başvurular Kapalı' : 
                           '🗳️ Oy Ver'}
                        </button>
                      ) : (
                        <button
                          onClick={() => placeBet(category.id, candidate)}
                          disabled={loading || !address || !betAmount}
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                        >
                          {loading ? '⏳ İşlem Yapılıyor...' : '🎲 Bahis Yap'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-lg font-semibold">İşlem gerçekleştiriliyor...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 