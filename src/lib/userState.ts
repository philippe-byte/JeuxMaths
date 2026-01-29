import { useState, useEffect } from 'react';
import { GameHistory, Level, CorrectionMode } from './types';

const USERS_STORAGE_KEY = 'jeuxmaths_users_v1';
const CURRENT_EMAIL_KEY = 'jeuxmaths_current_user_v1';

export interface LevelStats {
    wins: number;
    plays: number;
    totalTime: number; // in seconds
    bestStreak: number;
}

export interface UserStats {
    simple: LevelStats;
    advanced: LevelStats;
    expert: LevelStats;
}

export interface UserData {
    email: string;
    correctionMode: CorrectionMode;
    history: GameHistory[];
    stats: UserStats;
}

const initialStats: UserStats = {
    simple: { wins: 0, plays: 0, totalTime: 0, bestStreak: 0 },
    advanced: { wins: 0, plays: 0, totalTime: 0, bestStreak: 0 },
    expert: { wins: 0, plays: 0, totalTime: 0, bestStreak: 0 },
};

export function useUser() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentEmail = localStorage.getItem(CURRENT_EMAIL_KEY);
        if (currentEmail) {
            const users = getAllUsers();
            if (users[currentEmail]) {
                setUser(users[currentEmail]);
            }
        }
        setLoading(false);
    }, []);

    const getAllUsers = (): Record<string, UserData> => {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    };

    const saveUser = (u: UserData) => {
        setUser(u);
        const users = getAllUsers();
        users[u.email] = u;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_EMAIL_KEY, u.email);
    };

    const login = (email: string) => {
        const users = getAllUsers();
        if (users[email]) {
            setUser(users[email]);
            localStorage.setItem(CURRENT_EMAIL_KEY, email);
        } else {
            const newUser: UserData = {
                email,
                correctionMode: 'beginner',
                history: [],
                stats: initialStats
            };
            saveUser(newUser);
        }
    };

    const setCorrectionMode = (mode: CorrectionMode) => {
        if (!user) return;
        saveUser({ ...user, correctionMode: mode });
    };

    const addGameResult = (result: GameHistory) => {
        if (!user) return;

        const newHistory = [result, ...user.history];
        const levelStats = user.stats[result.level];

        const newStats = {
            ...user.stats,
            [result.level]: {
                wins: levelStats.wins + (result.status === 'won' ? 1 : 0),
                plays: levelStats.plays + 1,
                totalTime: levelStats.totalTime + (result.endTime ? (result.endTime - result.startTime) / 1000 : 0),
                bestStreak: result.status === 'won' ? levelStats.bestStreak + 1 : 0
            }
        };

        const updatedUser = { ...user, history: newHistory, stats: newStats };
        saveUser(updatedUser);
    };

    const resetStats = () => {
        if (!user) return;
        saveUser({ ...user, stats: initialStats, history: [] });
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem(CURRENT_EMAIL_KEY);
    };

    return { user, loading, login, logout, addGameResult, resetStats, setCorrectionMode, getAllUsers };
}
