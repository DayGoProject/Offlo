// ─── Offlo Web ↔ Chrome 확장 프로그램 통신 서비스 ───────────────────────────
//
// 확장 프로그램의 externally_connectable을 통해 오늘의 사용 현황 데이터를
// Offlo 웹앱으로 가져옵니다.
// ─────────────────────────────────────────────────────────────────────────────

// manifest.json에 등록된 확장 프로그램 ID (배포 후 실제 ID로 교체 필요)
// 개발 중에는 chrome://extensions에서 확인
const EXTENSION_ID = 'paelbkjmcopcapmkenbbibmijbmpgbhj';

export interface SiteStat {
    domain: string;
    limitMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
    achieved: boolean;
    savedMinutes: number;
}

export interface ExtensionTodayData {
    siteStats: SiteStat[];
    achievedCount: number;
    totalCount: number;
    totalSavedMinutes: number;
    streak: number;
    allAchieved: boolean;
}

/**
 * 확장 프로그램 설치 여부 확인 (PING 방식)
 */
export async function isExtensionInstalled(): Promise<boolean> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        return false;
    }
    return new Promise(resolve => {
        let resolved = false;
        const done = (result: boolean) => {
            if (!resolved) { resolved = true; resolve(result); }
        };
        const timer = setTimeout(() => done(false), 2000);
        try {
            chrome.runtime.sendMessage(
                EXTENSION_ID,
                { type: 'PING' },
                (response) => {
                    clearTimeout(timer);
                    if (chrome.runtime.lastError || !response?.success) {
                        done(false);
                    } else {
                        done(true);
                    }
                }
            );
        } catch {
            clearTimeout(timer);
            done(false);
        }
    });
}

/**
 * 확장 프로그램에서 오늘의 사용 현황 데이터 가져오기
 */
export async function getExtensionTodayData(): Promise<ExtensionTodayData | null> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        return null;
    }
    return new Promise(resolve => {
        let resolved = false;
        const done = (result: ExtensionTodayData | null) => {
            if (!resolved) { resolved = true; resolve(result); }
        };
        const timer = setTimeout(() => done(null), 3000);
        try {
            chrome.runtime.sendMessage(
                EXTENSION_ID,
                { type: 'GET_TODAY_DATA' },
                (response) => {
                    clearTimeout(timer);
                    if (chrome.runtime.lastError || !response?.success) {
                        done(null);
                    } else {
                        done(response.data as ExtensionTodayData);
                    }
                }
            );
        } catch {
            clearTimeout(timer);
            done(null);
        }
    });
}

/**
 * 오늘 차단 설정된 사이트들의 제한 시간 합산으로 식물 성장량 계산
 * - 기본: 차단 완료(만료)된 사이트의 limitMinutes 합산
 * - 차단 중인 사이트: remainingMinutes (지금까지 차단된 시간) 합산
 * - 연속 달성 스트릭: +5분 × 스트릭 수 (보너스)
 */
export function calculatePlantGrowth(data: ExtensionTodayData): number {
    const base = data.siteStats.reduce((sum, s) => {
        if (s.achieved) {
            // 차단 완료 → 설정한 전체 시간 적용
            return sum + s.limitMinutes;
        } else {
            // 차단 중 → 지금까지 차단된 시간(limitMinutes - remainingMinutes)
            const elapsed = s.limitMinutes - (s.remainingMinutes ?? 0);
            return sum + Math.max(0, elapsed);
        }
    }, 0);
    const streakBonus = data.streak * 5;
    return base + streakBonus;
}
