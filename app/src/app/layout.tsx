import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/context/AuthContext';
import { UserProvider } from "@/lib/context/UserContext";
import './globals.css';
import AuthRouteGuard from '@/components/AuthRouteGuard';
import WalletContextProvider from "@/lib/context/WalletContextProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'SolEdge',
    description: 'SolEdge质押应用',
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
                    <UserProvider>
                        <WalletContextProvider>
                            <AuthRouteGuard>
                                {children}
                            </AuthRouteGuard>
                        </WalletContextProvider>
                    </UserProvider>
                </AuthProvider>
            </body>
        </html>
    );
}