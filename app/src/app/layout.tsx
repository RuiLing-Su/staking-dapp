import Link from 'next/link';
import './globals.css';
import { UserProvider } from '@/lib/context/UserContext';
import { WalletProvider } from '@/lib/hooks/useWallet';
import Header from '@/components/layout/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <title>Staking</title>
      </head>
      <body>
        <WalletProvider>
          <UserProvider>
            <Header />
            {/* 添加 pt-20 避免固定 Header 遮挡内容 */}
            <main className="container min-h-screen pt-20 p-4">
              {children}
            </main>
            <footer className="container bg-gray-200 py-4 text-center text-gray-600">
              © {new Date().getFullYear()} Staking. All rights reserved.
            </footer>
          </UserProvider>
        </WalletProvider>
      </body>
    </html>
  );
}