'use client'

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/providers/Web3Provider';
import { CONTRACT_ADDRESSES, ABIS } from '@/config/contracts';

export default function Coinflip() {
  const { provider, address } = useWeb3();
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // useState yerine useEffect kullanıyoruz
  useEffect(() => {
    if (provider && address) {
      checkOwner();
    }
  }, [provider, address]);

  // Kontrat owner'ını kontrol et
  const checkOwner = async () => {
    if (!provider || !address) return;

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.COINFLIP,
        ABIS.COINFLIP,
        provider
      );

      const owner = await contract.owner();
      console.log("Contract owner:", owner);
      console.log("Current address:", address);
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error checking owner:", error);
    }
  };

  // Kontrata ETH yatırma fonksiyonu
  const handleDeposit = async () => {
    if (!provider || !depositAmount) return;

    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.COINFLIP,
        ABIS.COINFLIP,
        signer
      );

      const tx = await contract.deposit({
        value: ethers.utils.parseEther(depositAmount)
      });

      await tx.wait();
      alert("Depozit başarıyla yatırıldı!");
      setDepositAmount('');
    } catch (error: any) {
      console.error("Error depositing:", error);
      alert(`Depozit hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Debug için log ekleyelim
  console.log("Provider:", provider);
  console.log("Address:", address);

  const handleBet = async (guess: boolean) => {
    if (!provider || !amount) {
      alert("Lütfen cüzdanınızı bağlayın ve miktar girin!");
      return;
    }

    if (Number(amount) < 0.01) {
      alert("Minimum bahis miktarı 0.01 ETH'dir!");
      return;
    }

    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.COINFLIP,
        ABIS.COINFLIP,
        signer
      );

      const amountWei = ethers.utils.parseEther(amount);
      
      console.log("Placing bet with:", {
        guess,
        amount: amountWei.toString(),
        contract: CONTRACT_ADDRESSES.COINFLIP
      });

      // Place bet directly with ETH
      const tx = await contract.flipCoin(guess, {
        value: amountWei
      });
      
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      
      // Find the BetResult event
      const event = receipt.events?.find((e: any) => e.event === 'BetResult');
      if (event) {
        const win = event.args.win;
        alert(win ? "Tebrikler! Kazandınız! 🎉" : "Maalesef kaybettiniz. Tekrar deneyin!");
      }

      setAmount('');
    } catch (error: any) {
      console.error("Error placing bet:", error);
      alert(`Hata: ${error.message || "Bilinmeyen bir hata oluştu"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!provider || !address) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">ITU BLOCKCHAIN YAZI TURA</h1>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
          <p className="text-center text-red-500">
            Lütfen cüzdanınızı bağlayın!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">ITU BLOCKCHAIN YAZI TURA</h1>

      {isOwner && (
        <div className="max-w-md mx-auto bg-yellow-50 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Paneli</h2>
          <div className="mb-4">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Yatırılacak ETH miktarı"
              className="w-full p-2 border rounded mb-2"
              disabled={loading}
            />
            <button
              onClick={handleDeposit}
              disabled={loading || !depositAmount}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Kontrata ETH Yatır
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="mb-6">
          <div className="mb-4 text-sm">
            <p>Bağlı Adres: {address}</p>
          </div>
          
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ETH miktarı girin (min: 0.01)"
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
            min="0.01"
            step="0.01"
          />
          
          <div className="flex justify-between gap-4">
            <button
              onClick={() => handleBet(true)}
              disabled={loading || !amount || Number(amount) < 0.01}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Yazı
            </button>
            
            <button
              onClick={() => handleBet(false)}
              disabled={loading || !amount || Number(amount) < 0.01}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Tura
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-2">
              İşlem gerçekleştiriliyor...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>• Minimum bahis miktarı: 0.01 ETH</p>
          <p>• Kazanma şansı: %50</p>
          <p>• Kazanç: 2x</p>
        </div>
      </div>
    </div>
  );
} 