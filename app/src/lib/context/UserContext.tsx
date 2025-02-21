"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/authTypes.js';

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    inviteCode: string | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (code) {
            setInviteCode(code);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, inviteCode }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 