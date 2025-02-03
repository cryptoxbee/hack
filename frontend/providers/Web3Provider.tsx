'use client'

import { createConfig, WagmiConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { hardhat, sepolia } from 'wagmi/chains'

const { chains, publicClient } = configureChains(
  [hardhat, sepolia],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  publicClient,
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  )
} 