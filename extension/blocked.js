// Offlo Extension — blocked.js
const params = new URLSearchParams(location.search);
const domain = params.get('domain') || '이 사이트';
const until = parseInt(params.get('until') || '0', 10);

document.getElementById('domain-badge').textContent = domain;

function updateTimer() {
    const remaining = until - Date.now();
    if (remaining <= 0) {
        document.getElementById('remaining').textContent = '해제됨! 이동 중...';
        setTimeout(() => history.back(), 1000);
        return;
    }
    const s = Math.floor(remaining / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    document.getElementById('remaining').textContent =
        `${h > 0 ? h + '시간 ' : ''}${m}분 ${sec}초`;
}

updateTimer();
setInterval(updateTimer, 1000);

document.getElementById('btn-back').addEventListener('click', () => history.back());
