// 验证钱包地址格式
export const isValidWalletAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

// 验证昵称格式
export const isValidNickname = (nickname: string): boolean => {
    return nickname.length >= 2 && nickname.length <= 20;
};

// 验证邀请码格式
export const isValidInviteCode = (code: string): boolean => {
    return /^[A-Za-z0-9]{6,12}$/.test(code);
};