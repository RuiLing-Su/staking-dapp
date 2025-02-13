"use client";

import React, { useState, useCallback, createContext, useContext } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { StakingClient } from '../staking-client';
import { WalletState, WalletContextState } from '../types';
import { CONFIG } from '../config';
import Idl from '../idl.json';

const checkWalletNetwork = async (phantomWallet: any) => {
  if (!phantomWallet.publicKey) {
    throw new Error('Wallet not connected');
  }
  const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');
  const balance = await connection.getBalance(phantomWallet.publicKey);
  if (balance === undefined) {
    throw new Error('无法获取钱包余额');
  }
  return true;
};

const validateWalletAccount = async (connection: Connection, publicKey: PublicKey) => {
  const accountInfo = await connection.getAccountInfo(publicKey);
  if (!accountInfo) {
    throw new Error('钱包账户不存在');
  }
  const balance = await connection.getBalance(publicKey);
  if (balance < web3.LAMPORTS_PER_SOL * 0.01) {
    console.warn('账户余额过低');
  }
  return true;
};

const WalletContext = createContext<WalletContextState | undefined>(undefined);

const initialState: WalletState = {
  wallet: null,
  connection: null,
  program: null,
  client: null,
  connected: false,
  connecting: false,
  error: null,
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>(initialState);

  const connect = useCallback(async (phantomWallet: any) => {
    if (state.connecting) return;
    try {
      setState(prev => ({ ...prev, connecting: true, error: null }));
      if (!phantomWallet.isConnected) {
        throw new Error('钱包未连接');
      }
      await checkWalletNetwork(phantomWallet);
      const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');
      if (phantomWallet.publicKey) {
        await validateWalletAccount(connection, phantomWallet.publicKey);
      } else {
        throw new Error('未找到钱包公钥');
      }
      const provider = new AnchorProvider(connection, phantomWallet, { commitment: 'confirmed' });
      const programId = new PublicKey(CONFIG.PROGRAM_ID);
      const programInfo = await connection.getAccountInfo(programId);
      if (!programInfo) {
        throw new Error('程序不存在于网络上');
      }
      const program = new Program(Idl, programId, provider);
      const client = new StakingClient(program, connection, phantomWallet);
      setState({
        wallet: phantomWallet,
        connection,
        program,
        client,
        connected: true,
        connecting: false,
        error: null
      });
    } catch (error) {
      console.error('钱包连接失败:', error);
      setState(prev => ({
        ...initialState,
        error: error instanceof Error ? error : new Error('连接失败')
      }));
    }
  }, [state.connecting]);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextState => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet 必须在 WalletProvider 内使用');
  }
  return context;
};
