export const connectToPhantomWallet = async (): Promise<string> => {
  const phantomWallet = (window as any).solana;
  if (!phantomWallet) {
    throw new Error('请先安装 Phantom 钱包');
  }
  if (!phantomWallet.isConnected) {
    await phantomWallet.connect();
  }
  const walletAddress = phantomWallet.publicKey?.toString();
  if (!walletAddress) {
    throw new Error('获取钱包地址失败');
  }
  return walletAddress;
}; 