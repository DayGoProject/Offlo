// ─── Offlo Extension — Popup Script ──────────────────────────────────────────

const STORAGE_KEYS = {
    RULES: 'offlo_rules',
    USAGE: 'offlo_usage',
    STREAK: 'offlo_streak',
};

// ── 유틸 ──────────────────────────────────────────────────────────────────────
function formatMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
}

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

// ── 데이터 로드 ───────────────────────────────────────────────────────────────
async function loadData() {
    const data = await chrome.storage.local.get([
        STORAGE_KEYS.RULES,
        STORAGE_KEYS.USAGE,
        STORAGE_KEYS.STREAK,
    ]);
    return {
        rules: data[STORAGE_KEYS.RULES] || [],
        usage: data[STORAGE_KEYS.USAGE] || {},
        streak: data[STORAGE_KEYS.STREAK] || { count: 0, lastDate: '' },
    };
}

// ── UI 렌더링 ─────────────────────────────────────────────────────────────────
async function render() {
    const { rules, usage, streak } = await loadData();

    // 스트릭 배지
    const streakBadge = document.getElementById('streak-badge');
    const streakCount = document.getElementById('streak-count');
    if (streak.count > 0) {
        streakBadge.classList.remove('hidden');
        streakCount.textContent = streak.count;
    }

    // 요약 텍스트
    const summary = document.getElementById('today-summary');
    const achieved = rules.filter(r => (usage[r.domain] || 0) < r.limitMinutes * 60);
    if (rules.length === 0) {
        summary.textContent = '사이트를 추가해 시작하세요';
    } else {
        summary.textContent = `${achieved.length}/${rules.length}개 목표 달성 중`;
    }

    // 현황 리스트
    renderStats(rules, usage);

    // 규칙 목록
    renderRules(rules);
}

function renderStats(rules, usage) {
    const container = document.getElementById('stats-list');
    if (rules.length === 0) {
        container.innerHTML = '<div class="empty-state">아직 등록된 사이트가 없어요</div>';
        return;
    }

    container.innerHTML = rules.map(rule => {
        const usedSeconds = usage[rule.domain] || 0;
        const limitSeconds = rule.limitMinutes * 60;
        const usedMinutes = Math.round(usedSeconds / 60);
        const pct = clamp(Math.round((usedSeconds / limitSeconds) * 100), 0, 100);
        const isOver = usedSeconds >= limitSeconds;
        const statusClass = isOver ? 'over' : 'ok';
        const badgeText = isOver ? '초과' : '달성 중';

        return `
      <div class="stat-item ${isOver ? 'blocked' : 'achieved'}">
        <div class="stat-top">
          <span class="stat-domain">${rule.domain}</span>
          <span class="stat-badge ${statusClass}">${badgeText}</span>
        </div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill ${statusClass}" style="width:${pct}%"></div>
        </div>
        <div class="stat-time">
          <span>${formatMinutes(usedMinutes)} 사용</span>
          <span>제한 ${formatMinutes(rule.limitMinutes)}</span>
        </div>
      </div>
    `;
    }).join('');
}

function renderRules(rules) {
    const list = document.getElementById('rules-list');
    if (rules.length === 0) {
        list.innerHTML = '<div class="empty-state">추가된 목록이 없어요</div>';
        return;
    }

    list.innerHTML = rules.map((rule, idx) => `
    <li class="rule-item">
      <div class="rule-info">
        <span class="rule-domain">${rule.domain}</span>
        <span class="rule-limit">하루 ${formatMinutes(rule.limitMinutes)} 제한</span>
      </div>
      <button class="btn-delete" data-idx="${idx}" title="삭제">✕</button>
    </li>
  `).join('');

    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx);
            const data = await chrome.storage.local.get(STORAGE_KEYS.RULES);
            const rules = data[STORAGE_KEYS.RULES] || [];
            rules.splice(idx, 1);
            await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: rules });
            render();
        });
    });
}

// ── 폼 처리 ───────────────────────────────────────────────────────────────────
document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const domainInput = document.getElementById('domain-input');
    const limitInput = document.getElementById('limit-input');
    const errorEl = document.getElementById('form-error');

    const domain = domainInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const limitMinutes = parseInt(limitInput.value);

    // 유효성 검사
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        showError('올바른 도메인을 입력하세요 (예: youtube.com)');
        return;
    }
    if (!limitMinutes || limitMinutes < 1 || limitMinutes > 1440) {
        showError('1~1440 사이의 분을 입력하세요');
        return;
    }

    const data = await chrome.storage.local.get(STORAGE_KEYS.RULES);
    const rules = data[STORAGE_KEYS.RULES] || [];

    if (rules.some(r => r.domain === domain)) {
        showError('이미 등록된 사이트입니다');
        return;
    }

    rules.push({ domain, limitMinutes });
    await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: rules });

    domainInput.value = '';
    limitInput.value = '';
    errorEl.classList.add('hidden');
    render();

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }
});

// ── Offlo 대시보드 열기 ───────────────────────────────────────────────────────
document.getElementById('open-offlo-btn').addEventListener('click', () => {
    const url = 'https://offlo-app.web.app/dashboard';
    chrome.tabs.create({ url });
});

// ── 초기 렌더링 ───────────────────────────────────────────────────────────────
render();

// 실시간 갱신 (5초마다)
setInterval(render, 5000);
