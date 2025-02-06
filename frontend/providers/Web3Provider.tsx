'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  address: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  address: null,
  chainId: null,
  connectWallet: async () => {},
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Get provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Get accounts
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setProvider(provider);
          setAddress(accounts[0]);
          setChainId(network.chainId);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Get accounts
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setAddress(accounts[0]);
        setChainId(network.chainId);

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          } else {
            setAddress(null);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId: string) => {
          window.location.reload();
        });

      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <Web3Context.Provider value={{ provider, address, chainId, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
} 