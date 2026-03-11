// ─── Offlo Extension — background.js (Manifest V3 Service Worker) ────────────
//
// Manifest V3에서 setInterval은 Service Worker 슬립 시 동작 안 함.
// → 이벤트 기반 세션 추적으로 변경:
//   - tabs.onActivated / tabs.onUpdated / windows.onFocusChanged 에서 시간 계산
//   - 차단은 tabs.onUpdated의 'loading' 단계에서 즉시 리다이렉트
// ─────────────────────────────────────────────────────────────────────────────

const BLOCKED_PAGE = chrome.runtime.getURL('blocked.html');
const STORAGE_KEYS = {
    RULES: 'offlo_rules',
    USAGE: 'offlo_usage',
    STREAK: 'offlo_streak',
    LAST_RESET: 'offlo_last_reset'
};

// ── 인메모리 세션 상태 (SW 재시작 시 초기화되므로 Storage와 병행) ────────────
let activeSession = null; // { tabId, domain, startTime }

// ── 유틸 ──────────────────────────────────────────────────────────────────────
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function extractDomain(url) {
    try {
        if (!url || url.startsWith('chrome') || url.startsWith('extension')) return null;
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}

// ── Storage 헬퍼 ──────────────────────────────────────────────────────────────
async function getRules() {
    const d = await chrome.storage.local.get(STORAGE_KEYS.RULES);
    return d[STORAGE_KEYS.RULES] || [];
}

async function getUsage() {
    const d = await chrome.storage.local.get(STORAGE_KEYS.USAGE);
    return d[STORAGE_KEYS.USAGE] || {};
}

async function saveUsage(usage) {
    await chrome.storage.local.set({ [STORAGE_KEYS.USAGE]: usage });
}

// 해당 도메인에 규칙이 있는지 확인 (서브도메인 포함)
async function findRule(domain) {
    if (!domain) return null;
    const rules = await getRules();
    return rules.find(r => domain === r.domain || domain.endsWith('.' + r.domain)) || null;
}

// 제한 시간 초과 여부 확인
async function isOverLimit(rulesDomain, limitMinutes) {
    const usage = await getUsage();
    const usedSeconds = usage[rulesDomain] || 0;
    return usedSeconds >= limitMinutes * 60;
}

// ── 세션 종료 — 경과 시간을 Storage에 누적 ────────────────────────────────────
async function endSession() {
    if (!activeSession) return;
    const { domain, startTime } = activeSession;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    if (elapsed > 0) {
        const usage = await getUsage();
        usage[domain] = (usage[domain] || 0) + elapsed;
        await saveUsage(usage);
    }
    activeSession = null;
}

// ── 세션 시작 ─────────────────────────────────────────────────────────────────
function startSession(tabId, domain) {
    activeSession = { tabId, domain, startTime: Date.now() };
}

// ── 탭 포커스 변경 처리 ───────────────────────────────────────────────────────
async function handleTabFocus(tabId) {
    // 이전 세션 종료
    await endSession();

    if (!tabId || tabId < 0) return;

    try {
        const tab = await chrome.tabs.get(tabId);
        const domain = extractDomain(tab.url);
        const rule = await findRule(domain);
        if (!rule) return;

        const over = await isOverLimit(rule.domain, rule.limitMinutes);
        if (over) {
            chrome.tabs.update(tabId, { url: BLOCKED_PAGE + '?domain=' + rule.domain });
        } else {
            startSession(tabId, rule.domain);
        }
    } catch {
        // 탭이 이미 닫혔거나 접근 불가
    }
}

// ── 이벤트: 탭 활성화 ────────────────────────────────────────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    await handleTabFocus(tabId);
});

// ── 이벤트: 탭 URL 변경 (네비게이션) ────────────────────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // loading 단계에서 즉시 차단 여부를 확인 (가장 빠른 타이밍)
    if (changeInfo.status !== 'loading') return;

    const domain = extractDomain(tab.url);
    if (!domain) return;

    // blocked.html 자체는 무시
    if (tab.url && tab.url.startsWith(chrome.runtime.getURL(''))) return;

    const rule = await findRule(domain);
    if (!rule) {
        // 규칙 없는 사이트 → 이전 세션 종료만
        if (activeSession && activeSession.tabId === tabId) {
            await endSession();
        }
        return;
    }

    const over = await isOverLimit(rule.domain, rule.limitMinutes);
    if (over) {
        chrome.tabs.update(tabId, { url: BLOCKED_PAGE + '?domain=' + rule.domain });
        if (activeSession && activeSession.tabId === tabId) {
            activeSession = null; // 세션 취소 (차단됐으므로 시간 누적 불필요)
        }
    } else {
        // 규칙 있는 사이트로 이동 → 세션 시작
        if (activeSession && activeSession.tabId === tabId) {
            await endSession();
        }
        startSession(tabId, rule.domain);
    }
});

// ── 이벤트: 탭 닫힘 ──────────────────────────────────────────────────────────
chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (activeSession && activeSession.tabId === tabId) {
        await endSession();
    }
});

// ── 이벤트: 윈도우 포커스 변경 ───────────────────────────────────────────────
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // 브라우저 포커스를 잃음 → 세션 일시정지
        await endSession();
        return;
    }
    // 포커스 복귀 → 현재 활성 탭 재확인
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, windowId });
        if (activeTab) await handleTabFocus(activeTab.id);
    } catch { }
});

// ── 매일 자정 초기화 (Alarms) ─────────────────────────────────────────────────
async function scheduleReset() {
    const existing = await chrome.alarms.get('daily_reset');
    if (!existing) {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        chrome.alarms.create('daily_reset', {
            when: midnight.getTime(),
            periodInMinutes: 60 * 24
        });
    }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== 'daily_reset') return;
    await endSession();
    await updateStreak();
    await chrome.storage.local.set({
        [STORAGE_KEYS.USAGE]: {},
        [STORAGE_KEYS.LAST_RESET]: getTodayString()
    });
});

async function updateStreak() {
    const rules = await getRules();
    const usage = await getUsage();
    const allAchieved = rules.length > 0 && rules.every(rule => {
        return (usage[rule.domain] || 0) < rule.limitMinutes * 60;
    });

    const d = await chrome.storage.local.get(STORAGE_KEYS.STREAK);
    const streak = d[STORAGE_KEYS.STREAK] || { count: 0, lastDate: '' };
    const today = getTodayString();

    if (allAchieved) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        streak.count = streak.lastDate === yesterdayStr ? streak.count + 1 : 1;
        streak.lastDate = today;
    } else {
        streak.count = 0;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.STREAK]: streak });
}

// ── externally_connectable: Offlo 웹 → 확장 요청 처리 ───────────────────────
const ALLOWED_ORIGINS = [
    'https://offlo-app.web.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
];

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (!ALLOWED_ORIGINS.includes(sender.origin)) {
        sendResponse({ success: false, error: 'Unauthorized' });
        return true;
    }

    (async () => {
        if (message.type === 'PING') {
            // 설치 여부 확인용 핑
            sendResponse({ success: true, alive: true });

        } else if (message.type === 'GET_RULES') {
            const rules = await getRules();
            sendResponse({ success: true, data: rules });

        } else if (message.type === 'GET_TODAY_DATA') {
            const [rules, usage, streakData] = await Promise.all([
                getRules(),
                getUsage(),
                chrome.storage.local.get(STORAGE_KEYS.STREAK)
            ]);
            const streak = streakData[STORAGE_KEYS.STREAK] || { count: 0, lastDate: '' };

            const siteStats = rules.map(rule => {
                const usedSeconds = usage[rule.domain] || 0;
                const limitSeconds = rule.limitMinutes * 60;
                return {
                    domain: rule.domain,
                    limitMinutes: rule.limitMinutes,
                    usedMinutes: Math.round(usedSeconds / 60),
                    achieved: usedSeconds < limitSeconds,
                    savedMinutes: Math.max(0, Math.round((limitSeconds - usedSeconds) / 60))
                };
            });

            sendResponse({
                success: true,
                data: {
                    siteStats,
                    achievedCount: siteStats.filter(s => s.achieved).length,
                    totalCount: rules.length,
                    totalSavedMinutes: siteStats.reduce((a, s) => a + s.savedMinutes, 0),
                    streak: streak.count,
                    allAchieved: siteStats.length > 0 && siteStats.every(s => s.achieved)
                }
            });

        } else {
            sendResponse({ success: false, error: 'Unknown type' });
        }
    })();

    return true; // async sendResponse 필수
});

// ── 설치/시작 시 초기화 ───────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
    const d = await chrome.storage.local.get(STORAGE_KEYS.LAST_RESET);
    if (!d[STORAGE_KEYS.LAST_RESET]) {
        await chrome.storage.local.set({
            [STORAGE_KEYS.RULES]: [],
            [STORAGE_KEYS.USAGE]: {},
            [STORAGE_KEYS.STREAK]: { count: 0, lastDate: '' },
            [STORAGE_KEYS.LAST_RESET]: getTodayString()
        });
    }
    await scheduleReset();
});

chrome.runtime.onStartup.addListener(async () => {
    await scheduleReset();
});
