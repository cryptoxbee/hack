import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const getWeb3Provider = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      return new ethers.providers.Web3Provider(window.ethereum);
    } catch (error) {
      console.error("Error creating Web3Provider:", error);
      return null;
    }
  }
  return null;
};

export const connectWallet = async () => {
  try {
    const provider = getWeb3Provider();
    if (!provider) {
      throw new Error("Please install MetaMask");
    }

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Ağ kontrolü
    const network = await provider.getNetwork();
    console.log("Connected to network:", network);

    return { signer, address, network };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Ağ değişikliğini kontrol etme
export const switchNetwork = async (chainId: string) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    // Ağ ekli değilse ekleme
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId,
            rpcUrls: ['YOUR_RPC_URL'],
            chainName: 'YOUR_NETWORK_NAME',
            nativeCurrency: {
              name: 'CURRENCY_NAME',
              symbol: 'SYMBOL',
              decimals: 18
            },
          }],
        });
      } catch (addError) {
        console.error("Error adding network:", addError);
        throw addError;
      }
    }
    console.error("Error switching network:", error);
    throw error;
  }
}; 