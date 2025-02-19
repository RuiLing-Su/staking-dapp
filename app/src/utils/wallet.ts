export const connectToPhantomWallet = async (): Promise<string> => {
  const phantomWallet = (window as any).solana;
  if (!phantomWallet) {
    window.open('https://phantom.app/','_blank');
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