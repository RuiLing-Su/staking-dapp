// # 新增：API客户端配置

export interface User {
    user_id?: number;
    nickname: string;
    avatar?: string;
    wallet_address: string;
    total_principal?: string;
    withdrawable_earnings?: string;
    purchase_only_earnings?: string;
    total_earnings?: string;
    status?: number;
    status_display?: string;
    invite_code: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    nickname: string;
    avatar?: string;
    wallet_address: string;
    invite_code?: string;
}

export interface RegisterCredentials {
    nickname: string;
    avatar?: string;
    wallet_address: string;
    invite_code?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}