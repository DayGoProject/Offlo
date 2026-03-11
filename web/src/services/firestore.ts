import {
    doc,
    collection,
    getDoc,
    getDocs,
    setDoc,
    orderBy,
    query,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface AnalysisRecord {
    id: string;
    imageUrl: string;
    result: {
        totalMinutes: number;
        apps: { name: string; minutes: number }[];
        advice: string;
    };
    createdAt: Timestamp;
}

export interface PlantData {
    level: number;
    totalDetoxMinutes: number;
    lastUpdated: Timestamp;
}

export interface GoalData {
    id: string;
    title: string;
    targetMinutes: number;
    startDate: Timestamp;
    endDate: Timestamp;
    status: 'active' | 'completed' | 'failed';
}

// ─── 최근 분석 기록 조회 ────────────────────────────────────
export async function getRecentAnalyses(uid: string, count = 5): Promise<AnalysisRecord[]> {
    const analysesRef = collection(db, 'users', uid, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<AnalysisRecord, 'id'>),
    }));
}

// ─── 이번 주 분석 기록 조회 (7일치) ────────────────────────
export async function getWeeklyAnalyses(uid: string): Promise<AnalysisRecord[]> {
    const analysesRef = collection(db, 'users', uid, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'), limit(7));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<AnalysisRecord, 'id'>),
    }));
}

// ─── 나의 정원(식물) 데이터 조회 ────────────────────────────
export async function getPlantData(uid: string): Promise<PlantData | null> {
    const plantRef = doc(db, 'users', uid, 'garden', 'plant');
    const snap = await getDoc(plantRef);
    return snap.exists() ? (snap.data() as PlantData) : null;
}

// ─── 정원(식물) 데이터 업데이트 ─────────────────────────────
export async function updatePlantData(uid: string, data: Partial<PlantData>): Promise<void> {
    const plantRef = doc(db, 'users', uid, 'garden', 'plant');
    await setDoc(plantRef, { ...data, lastUpdated: Timestamp.now() }, { merge: true });
}

// ─── 활성 목표 조회 ─────────────────────────────────────────
export async function getActiveGoal(uid: string): Promise<GoalData | null> {
    const goalsRef = collection(db, 'users', uid, 'goals');
    const q = query(goalsRef, limit(5));
    const snapshot = await getDocs(q);
    const active = snapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<GoalData, 'id'>) }))
        .find(g => g.status === 'active');
    return active || null;
}

// ─── 식물 성장 단계 계산 ─────────────────────────────────────
const PLANT_LEVEL_THRESHOLDS = [0, 60, 180, 360, 720, 1440];

function calcLevel(totalMinutes: number): number {
    for (let i = PLANT_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalMinutes >= PLANT_LEVEL_THRESHOLDS[i]) return i;
    }
    return 0;
}

// ─── 식물 레벨업 (성장량 추가) ─────────────────────────────────
export async function levelUpPlant(uid: string, growthMinutes: number): Promise<PlantData> {
    const existing = await getPlantData(uid);
    const prevMinutes = existing?.totalDetoxMinutes ?? 0;
    const newTotal = prevMinutes + growthMinutes;
    const newLevel = calcLevel(newTotal);
    const updated: Partial<PlantData> = { level: newLevel, totalDetoxMinutes: newTotal };
    await updatePlantData(uid, updated);
    return { level: newLevel, totalDetoxMinutes: newTotal, lastUpdated: Timestamp.now() };
}

// ─── 스트릭 조회 ─────────────────────────────────────────────
export interface StreakData {
    count: number;
    lastDate: string;
}

export async function getStreak(uid: string): Promise<StreakData> {
    const ref = doc(db, 'users', uid, 'garden', 'streak');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as StreakData) : { count: 0, lastDate: '' };
}

// ─── 스트릭 저장 ─────────────────────────────────────────────
export async function saveStreak(uid: string, data: StreakData): Promise<void> {
    const ref = doc(db, 'users', uid, 'garden', 'streak');
    await setDoc(ref, data, { merge: true });
}
