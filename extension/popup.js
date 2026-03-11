// ─── Offlo Extension — Popup Script ──────────────────────────────────────────

const KEYS = { RULES: 'offlo_rules', STREAK: 'offlo_streak' };

function fmtMs(ms) {
    if (ms <= 0) return '차단 해제됨';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}시간 ${m}분 ${sec}초 남음`;
    if (m > 0) return `${m}분 ${sec}초 남음`;
    return `${sec}초 남음`;
}

function fmtLimit(min) {
    const h = Math.floor(min / 60), m = min % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
}

async function loadData() {
    const d = await chrome.storage.local.get([KEYS.RULES, KEYS.STREAK]);
    return {
        rules: d[KEYS.RULES] || [],
        streak: d[KEYS.STREAK] || { count: 0, lastDate: '' },
    };
}

async function render() {
    const { rules, streak } = await loadData();
    const now = Date.now();

    // 스트릭 배지
    const badge = document.getElementById('streak-badge');
    const scnt = document.getElementById('streak-count');
    if (streak.count > 0) { badge.classList.remove('hidden'); scnt.textContent = streak.count; }
    else badge.classList.add('hidden');

    // 요약
    const summary = document.getElementById('today-summary');
    const activeCount = rules.filter(r => r.blockUntil && now < r.blockUntil).length;
    if (rules.length === 0) {
        summary.textContent = '사이트를 추가해 차단하세요';
    } else {
        summary.textContent = `${activeCount}개 차단 중 / 총 ${rules.length}개`;
    }

    renderStats(rules, now);
    renderRules(rules, now);
}

function isBlocked(rule, now) {
    return rule.blockUntil && now < rule.blockUntil;
}

function renderStats(rules, now) {
    const el = document.getElementById('stats-list');
    if (rules.length === 0) {
        el.innerHTML = '<div class="empty-state">아직 등록된 사이트가 없어요</div>';
        return;
    }
    el.innerHTML = rules.map(rule => {
        const blocked = isBlocked(rule, now);
        const remaining = blocked ? rule.blockUntil - now : 0;
        const total = rule.limitMinutes * 60000;
        const pct = blocked ? Math.round(((total - remaining) / total) * 100) : 100;
        const cls = blocked ? 'over' : 'ok';
        return `
      <div class="stat-item ${blocked ? 'blocked' : 'achieved'}">
        <div class="stat-top">
          <span class="stat-domain">${rule.domain}</span>
          <span class="stat-badge ${cls}">${blocked ? '차단 중' : '해제됨'}</span>
        </div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill ${cls}" style="width:${pct}%"></div>
        </div>
        <div class="stat-time">
          <span>${blocked ? fmtMs(remaining) : '✅ 차단 해제됨'}</span>
          <span>제한 ${fmtLimit(rule.limitMinutes)}</span>
        </div>
      </div>`;
    }).join('');
}

function renderRules(rules, now) {
    const list = document.getElementById('rules-list');
    if (rules.length === 0) {
        list.innerHTML = '<div class="empty-state">추가된 목록이 없어요</div>';
        return;
    }
    list.innerHTML = rules.map((rule, idx) => {
        const blocked = isBlocked(rule, now);
        return `
      <li class="rule-item">
        <div class="rule-info">
          <span class="rule-domain">${rule.domain}</span>
          <span class="rule-limit">${blocked ? '🚫 차단 중' : '✅ 해제됨'} · ${fmtLimit(rule.limitMinutes)} 설정</span>
        </div>
        <button class="btn-delete" data-idx="${idx}" title="삭제">✕</button>
      </li>`;
    }).join('');

    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx);
            const d = await chrome.storage.local.get(KEYS.RULES);
            const rs = d[KEYS.RULES] || [];
            rs.splice(idx, 1);
            await chrome.storage.local.set({ [KEYS.RULES]: rs });
            render();
        });
    });
}

// ── 사이트 추가 ───────────────────────────────────────────────────────────────
document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const domainInput = document.getElementById('domain-input');
    const limitInput = document.getElementById('limit-input');
    const errorEl = document.getElementById('form-error');

    const domain = domainInput.value.trim().toLowerCase()
        .replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const limitMinutes = parseInt(limitInput.value);

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }

    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return showError('올바른 도메인을 입력하세요');
    if (!limitMinutes || limitMinutes < 1 || limitMinutes > 1440) return showError('1~1440분을 입력하세요');

    const d = await chrome.storage.local.get(KEYS.RULES);
    const rs = d[KEYS.RULES] || [];
    if (rs.some(r => r.domain === domain)) return showError('이미 등록된 사이트입니다');

    // 지금부터 limitMinutes 동안 차단
    rs.push({ domain, limitMinutes, blockUntil: Date.now() + limitMinutes * 60 * 1000 });
    await chrome.storage.local.set({ [KEYS.RULES]: rs });

    domainInput.value = '';
    limitInput.value = '';
    errorEl.classList.add('hidden');
    render();
});

document.getElementById('open-offlo-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://offlo-app.web.app/garden' });
});

// 1초마다 카운트다운 갱신
render();
setInterval(render, 1000);
