import React, { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { User } from "@/types/authTypes";

interface UserInfoCardProps {
  userInfo: User;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ userInfo }) => {
  const [showFullAddress, setShowFullAddress] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("钱包地址已复制!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
        当前用户信息
      </h3>
      <div className="space-y-3 text-gray-700 text-sm">
        <p>昵称：{userInfo.nickname}</p>

        {/* 钱包地址：居中 + 可复制 + 展开/隐藏 */}
        <div className="flex flex-col items-center text-center">
          <p className="font-medium">钱包地址：</p>
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
            <span className="text-blue-600 font-mono">
              {showFullAddress
                ? userInfo.wallet_address
                : `${userInfo.wallet_address.slice(0, 6)}...${userInfo.wallet_address.slice(
                    -4
                  )}`}
            </span>
            <button onClick={() => setShowFullAddress(!showFullAddress)}>
              {showFullAddress ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button onClick={() => handleCopy(userInfo.wallet_address)}>
              <Copy size={18} />
            </button>
          </div>
        </div>

        <p>总本金：{userInfo.total_principal} USDC</p>
        <p>可提取收益：{userInfo.withdrawable_earnings} USDC</p>
        <p>仅限购币收益：{userInfo.purchase_only_earnings} USDC</p>
        <p>总收益：{userInfo.total_earnings} USDC</p>
        <p>状态：{userInfo.status_display}</p>
        <p>邀请码：{userInfo.invite_code}</p>
        <p>直推总数：{userInfo.direct_invite_total}</p>
        <p>间推总数：{userInfo.indirect_invite_total}</p>
      </div>
    </div>
  );
};

export default UserInfoCard;