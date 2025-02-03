import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from '../providers/Web3Provider'
import { Navigation } from '../components/Navigation'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Öğrenci Kulübü Seçim Platformu",
  description: "Blockchain tabanlı seçim ve bahis platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Web3Provider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
