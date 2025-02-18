import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/context/AuthContext';
import { WalletProvider } from "@/lib/hooks/useWallet";
import { UserProvider } from "@/lib/context/UserContext";
import './globals.css';
import AuthRouteGuard from '@/components/AuthRouteGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Staking Dapp',
    description: '去中心化质押应用',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh">
            <body className={inter.className}>
                <AuthProvider>
                    <WalletProvider>
                        <UserProvider>
                            <AuthRouteGuard>
                                {children}
                            </AuthRouteGuard>
                        </UserProvider>
                    </WalletProvider>
                </AuthProvider>
            </body>
        </html>
    );
}