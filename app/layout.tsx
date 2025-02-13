import Link from 'next/link';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <title>Staking Dapp</title>
      </head>
      <body>
        <header className="bg-blue-600 text-white py-4">
          <nav className="container mx-auto flex justify-between items-center">
            <div className="text-xl font-bold">Staking Dapp</div>
            <ul className="flex space-x-4">
              <li>
                <Link href="/dashboard">仪表盘</Link>
              </li>
              <li>
                <Link href="/stake">质押</Link>
              </li>
              <li>
                <Link href="/reward">奖励</Link>
              </li>
              <li>
                <Link href="/referral">推荐</Link>
              </li>
              <li>
                <Link href="/level">等级</Link>
              </li>
              <li>
                <Link href="/meme">MEME代币</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
} 