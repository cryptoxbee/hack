'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectWallet } from '@/lib/web3';

export default function Home() {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    try {
      const { address } = await connectWallet();
      setAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-12">ITU BLOCKCHAIN</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Yazı Tura */}
        <a href="/coinflip" className="block">
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Yazı Tura</h2>
            <p className="text-gray-600">ETH ile yazı tura oyunu oynayın.</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>• Minimum: 0.01 ETH</p>
              <p>• Kazanç: 2x</p>
            </div>
          </div>
        </a>

        {/* Board Seçimleri */}
        <a href="/election" className="block">
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Board Seçimleri</h2>
            <p className="text-gray-600">ITU Blockchain board seçimlerine katılın.</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>• 6 Farklı Kategori</p>
              <p>• Oy Ver & Bahis Yap</p>
            </div>
          </div>
        </a>

        <Link href="/election-predict" className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold mb-2">Seçim Tahminleri</h2>
          <p>Board seçim sonuçlarını tahmin edin ve ödül kazanın</p>
        </Link>

        <Link href="/hackpot" className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-xl font-bold mb-2 text-purple-600">Hackpot</h2>
          <p className="text-gray-700">Hackpot oyununa katılın ve büyük ödülü kazanma şansı yakalayın</p>
          <div className="mt-4 text-sm text-purple-500">
            🎮 Şans oyunu | 💰 Token ödülleri
          </div>
        </Link>

        <Link href="/phackpot" className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-xl font-bold mb-2 text-green-600">pHackpot</h2>
          <p className="text-gray-700">Practice Hackpot ile deneyim kazanın</p>
          <div className="mt-4 text-sm text-green-500">
            🎮 Practice modu | 🎯 Risksiz deneyim
          </div>
        </Link>
      </div>

      <footer className="mt-12 text-center text-gray-600">
        <p>Tüm işlemler için cüzdanınızın bağlı olduğundan emin olun</p>
        <p className="mt-2 text-sm">Güvenli oyun için lütfen risk limitlerini göz önünde bulundurun</p>
      </footer>
    </div>
  );
}