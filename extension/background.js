// ─── Offlo Extension — background.js ────────────────────────────────────────
//
// 동작 방식: 차단 타이머
//   - 사이트 추가 시 즉시 차단 시작 (blockUntil = 지금 + 제한시간)
//   - blockUntil 이전 → 차단 (blocked.html으로 리다이렉트)
//   - blockUntil 이후 → 차단 해제, 접속 가능
//   - 1분마다 전체 탭 스캔 (만료 체크, 차단 중 탭 유지)
// ─────────────────────────────────────────────────────────────────────────────

const BLOCKED_PAGE = chrome.runtime.getURL('blocked.html');
const KEYS = {
    RULES: 'offlo_rules',   // [{ domain, limitMinutes, blockUntil }]
    STREAK: 'offlo_streak',
};

// ── 유틸 ──────────────────────────────────────────────────────────────────────
function extractDomain(url) {
    try {
        if (!url || url.startsWith('chrome') || url.startsWith(BLOCKED_PAGE.split('?')[0])) return null;
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}

async function getRules() {
    const d = await chrome.storage.local.get(KEYS.RULES);
    return d[KEYS.RULES] || [];
}

async function saveRules(rules) {
    await chrome.storage.local.set({ [KEYS.RULES]: rules });
}

// ── 현재 차단 중인지 확인 (blockUntil > 지금) ────────────────────────────────
function isCurrentlyBlocked(rule) {
    return rule.blockUntil && Date.now() < rule.blockUntil;
}

// 도메인과 매칭되는 활성 차단 규칙 반환
async function findBlockedRule(domain) {
    if (!domain) return null;
    const rules = await getRules();
    return rules.find(r =>
        isCurrentlyBlocked(r) &&
        (domain === r.domain || domain.endsWith('.' + r.domain))
    ) || null;
}

// ── 전체 탭 스캔 ──────────────────────────────────────────────────────────────
async function scanAllTabs() {
    const rules = await getRules();
    const blockedDomains = rules
        .filter(r => isCurrentlyBlocked(r))
        .map(r => r.domain);

    if (blockedDomains.length === 0) return;

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (!tab.url || tab.url.includes('blocked.html')) continue;
        const domain = extractDomain(tab.url);
        if (!domain) continue;
        for (const bd of blockedDomains) {
            if (domain === bd || domain.endsWith('.' + bd)) {
                chrome.tabs.update(tab.id, {
                    url: BLOCKED_PAGE + '?domain=' + bd
                }).catch(() => { });
                break;
            }
        }
    }
}

// ── 알람: 1분마다 탭 스캔 ─────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'scan_tabs') {
        await scanAllTabs();
    }
});

// ── 탭 내비게이션 시 즉시 확인 ───────────────────────────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'loading') return;
    const url = tab.url;
    if (!url || url.includes('blocked.html')) return;

    const domain = extractDomain(url);
    const rule = await findBlockedRule(domain);
    if (rule) {
        chrome.tabs.update(tabId, {
            url: BLOCKED_PAGE + '?domain=' + rule.domain + '&until=' + rule.blockUntil
        }).catch(() => { });
    }
});

// ── 새 탭 확인 ────────────────────────────────────────────────────────────────
chrome.tabs.onCreated.addListener(async (tab) => {
    if (!tab.url || tab.url.includes('blocked.html')) return;
    const domain = extractDomain(tab.url);
    const rule = await findBlockedRule(domain);
    if (rule) {
        setTimeout(() => {
            chrome.tabs.update(tab.id, {
                url: BLOCKED_PAGE + '?domain=' + rule.domain + '&until=' + rule.blockUntil
            }).catch(() => { });
        }, 300);
    }
});

// ── externally_connectable ────────────────────────────────────────────────────
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
            sendResponse({ success: true, alive: true });

        } else if (message.type === 'GET_TODAY_DATA') {
            const [rules, sd] = await Promise.all([
                getRules(),
                chrome.storage.local.get(KEYS.STREAK)
            ]);
            const streak = sd[KEYS.STREAK] || { count: 0, lastDate: '' };
            const now = Date.now();
            const siteStats = rules.map(r => {
                const remaining = r.blockUntil ? Math.max(0, Math.round((r.blockUntil - now) / 60000)) : 0;
                return {
                    domain: r.domain,
                    limitMinutes: r.limitMinutes,
                    remainingMinutes: remaining,
                    usedMinutes: Math.max(0, r.limitMinutes - remaining),
                    achieved: !isCurrentlyBlocked(r),
                    savedMinutes: remaining
                };
            });
            sendResponse({
                success: true,
                data: {
                    siteStats,
                    achievedCount: siteStats.filter(s => s.achieved).length,
                    totalCount: rules.length,
                    totalSavedMinutes: 0,
                    streak: streak.count,
                    allAchieved: rules.length > 0 && rules.every(r => !isCurrentlyBlocked(r))
                }
            });
        } else {
            sendResponse({ success: false, error: 'Unknown type' });
        }
    })();
    return true;
});

// ── 설치/시작 ─────────────────────────────────────────────────────────────────
async function setup() {
    const ex = await chrome.alarms.get('scan_tabs');
    if (!ex) chrome.alarms.create('scan_tabs', { periodInMinutes: 1 });
}

chrome.runtime.onInstalled.addListener(async () => {
    const d = await chrome.storage.local.get(KEYS.RULES);
    if (!d[KEYS.RULES]) {
        await chrome.storage.local.set({
            [KEYS.RULES]: [],
            [KEYS.STREAK]: { count: 0, lastDate: '' },
        });
    }
    await setup();
});

chrome.runtime.onStartup.addListener(async () => {
    await setup();
    await scanAllTabs();
});
