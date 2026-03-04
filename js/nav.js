/* ============================================================
   nav.js — 네비게이션 스크롤 효과, 햄버거, 드롭다운
   ============================================================ */

const nav = document.getElementById('nav');

// 스크롤 시 Nav 배경 강화
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── 드롭다운: hover (desktop) & click (tablet / a11y) ──
const dropItems = document.querySelectorAll('.nav-item.has-dropdown');

dropItems.forEach(item => {
    // 마우스 enter / leave
    item.addEventListener('mouseenter', () => item.classList.add('open'));
    item.addEventListener('mouseleave', () => item.classList.remove('open'));

    // 탭 링크 클릭으로 토글
    const trigger = item.querySelector('.nav-link-dd');
    trigger.addEventListener('click', (e) => {
        const isOpen = item.classList.contains('open');
        // 다른 모든 드롭다운 닫기
        dropItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
            e.preventDefault();
            item.classList.add('open');
        }
    });
});

// 바깥 클릭 시 드롭다운 모두 닫기
document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
        dropItems.forEach(i => i.classList.remove('open'));
    }
});

// ── 모바일 햄버거 메뉴 토글 ──
const hamburger = document.getElementById('nav-hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
    });
}
