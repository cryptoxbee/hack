'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center">
            <Link 
              href="/" 
              className={`${pathname === '/' ? 'text-primary-600 font-bold text-xl' : 'text-gray-600 text-xl'} hover:text-primary-500`}
            >
              Jackocracy
            </Link>
            <Link 
              href="/vote" 
              className={`${pathname === '/vote' ? 'text-primary-600' : 'text-gray-600'} hover:text-primary-500`}
            >
              Vote
            </Link>
            <Link 
              href="/jackpot" 
              className={`${pathname === '/jackpot' ? 'text-primary-600' : 'text-gray-600'} hover:text-primary-500`}
            >
              Jackpot
            </Link>
            <Link 
              href="/flip" 
              className={`${pathname === '/flip' ? 'text-primary-600' : 'text-gray-600'} hover:text-primary-500`}
            >
              Coin Flip
            </Link>
          </div>

          <div className="flex items-center">
            <button className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 