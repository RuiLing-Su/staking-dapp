export const connectToPhantomWallet = async (): Promise<string> => {
  const phantomWallet = (window as any).solana;
  if (!phantomWallet) {
    throw new Error("请先安装 Phantom 钱包");
  }
  try {
    if (!phantomWallet.isConnected) {
      await phantomWallet.connect();
    }
  } catch (error: any) {
    console.error("钱包连接时发生错误：", error);
    throw new Error(`钱包连接失败: ${error.message || error}`);
  }
  const walletAddress = phantomWallet.publicKey?.toString();
  if (!walletAddress) {
    throw new Error("获取钱包地址失败");
  }
  return walletAddress;
};