import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WalletConnectSection = ({ onConnect, loading }) => {
    return (
        <div className="text-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
            >
                <div className="mb-8">
                    <Wallet className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        欢迎来到StakingDapp
                    </h2>
                    <p className="text-gray-600 mb-6">
                        请连接你的 Solana 钱包
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onConnect}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white 
              ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
              transition-colors duration-200 flex items-center justify-center`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                                连接中...
                            </>
                        ) : (
                            <>
                                <Wallet className="w-5 h-5 mr-2" />
                                连接钱包
                            </>
                        )}
                    </button>

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            说明
                        </h3>
                        <ul className="text-sm text-blue-800 text-left space-y-2">
                            <li>• 质押系统支持 Phantom、Solflare 等主流钱包</li>
                            <li>• 请确保钱包中有足够的 SOL 支付矿工费</li>
                            <li>• 如遇问题请联系客服获取帮助</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WalletConnectSection;