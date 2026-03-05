// TypeScript 공통 타입 정의
import type { User } from 'firebase/auth';

export interface UserProfile {
    name: string;
    email: string;
    premium: boolean;
    createdAt: unknown;
}

export interface Analysis {
    id: string;
    imageUrl: string;
    result: string;
    chartData?: AppUsage[];
    createdAt: unknown;
    isPremium: boolean;
}

export interface AppUsage {
    app: string;
    minutes: number;
    percentage: number;
}

export interface Goal {
    id: string;
    title: string;
    targetMinutes: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'failed';
}

export interface Plant {
    level: number;
    totalDetoxMinutes: number;
    lastUpdated: unknown;
}

export interface Badge {
    id: string;
    name: string;
    earnedAt: unknown;
    shared: boolean;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
}
