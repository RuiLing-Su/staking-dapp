"use client";

import { FC, ReactNode, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from '@solana/web3.js'
import * as walletAdapterWallets from '@solana/wallet-adapter-wallets';
import { authApi } from '@/api/auth';
import {RegisterCredentials} from "@/types/authTypes";
import { useUser } from '@/lib/context/UserContext';
require('@solana/wallet-adapter-react-ui/styles.css');

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const endpoint = web3.clusterApiUrl('devnet')
	const wallets = [new walletAdapterWallets.PhantomWalletAdapter()]
	const { inviteCode } = useUser();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		const provider = (window as any).solana;

		if (provider) {
			const handleConnect = async () => {
				const resp = await provider.connect();
				const walletAddress = resp.publicKey.toString();

				const credentials: RegisterCredentials = {
					nickname: `user_${Math.floor(Math.random() * 10000)}`,
					wallet_address: walletAddress,
					invite_code: inviteCode || undefined,
					avatar: "/human.png",
				};

				await authApi.register(credentials);
				window.location.reload();
			};

			const handleDisconnect = async () => {
				await authApi.logout();
				window.location.reload();
			};

			provider.on("connect", handleConnect);
			provider.on("disconnect", handleDisconnect);

			return () => {
				provider.disconnect();
			};
		}
	}, []);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets}>
				<WalletModalProvider>
					{isClient ? children : null}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}

export default WalletContextProvider