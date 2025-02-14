import React, { createContext, useContext, useState } from "react";

interface WalletContextType {
  client: any;
  connected: boolean;
  connecting: boolean;
  connect: (solana: any) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = async (solana: any) => {
    setConnecting(true);
    // 实际钱包连接逻辑请替换此处代码
    setClient(solana);
    setConnected(true);
    setConnecting(false);
  };

  return (
    <WalletContext.Provider value={{ client, connected, connecting, connect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};