import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/auth';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const { user } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setActiveDropdown(null);
    }, [location]);

    const handleLogout = async () => {
        await logout();
    };

    const dropdownItems = {
        features: [
            { icon: '📊', title: '스크린 타임 분석', desc: 'AI가 사용 패턴을 파악해드립니다', href: '/#features' },
            { icon: '🪴', title: '식물 키우기 보상', desc: '디톡스 달성 시 반려 식물이 자라요', href: '/garden' },
            { icon: '🏅', title: '배지 & 칭호 시스템', desc: '재밌는 등급으로 동기를 부여해요', href: '/badges' },
        ],
        stats: [
            { icon: '📉', title: '스크린 타임 감소', desc: '첫 주 평균 30% 이상 줄어들었어요', href: '/#stats' },
            { icon: '😴', title: '수면의 질 개선', desc: '취침 전 습관 변화로 숙면을 경험하세요', href: '/#stats' },
            { icon: '🧠', title: '집중력 향상', desc: '94%의 사용자가 집중력이 좋아졌다고 해요', href: '/#stats' },
        ],
        howto: [
            { icon: '①', title: '캡처 업로드', desc: '스크린 타임 화면을 사진으로 올려요', href: '/#features' },
            { icon: '②', title: 'AI 분석 & 솔루션', desc: '맞춤 디톡스 방법을 추천받아요', href: '/analysis' },
            { icon: '③', title: '실천하고 보상받기', desc: '달성하면 식물이 자라고 배지를 얻어요', href: '/garden' },
        ],
        pricing: [
            { icon: '🌿', title: 'Free', desc: '기본 분석 + 식물 1개 — 무료', href: '/pricing' },
            { icon: '🌳', title: 'Pro', desc: '무제한 분석 + 배지 + 공유 기능', href: '/pricing' },
        ],
    };

    return (
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-inner">
                <Link to="/" className="nav-logo">
                    <img src="/logo.png" alt="Offlo" className="nav-logo-img" />
                </Link>

                <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                    {[
                        { key: 'features', label: '기능', items: dropdownItems.features },
                        { key: 'stats', label: '효과', items: dropdownItems.stats },
                        { key: 'howto', label: '사용법', items: dropdownItems.howto },
                        { key: 'pricing', label: '요금제', items: dropdownItems.pricing },
                    ].map(({ key, label, items }) => (
                        <li
                            key={key}
                            className={`nav-item has-dropdown ${activeDropdown === key ? 'active' : ''}`}
                            onMouseEnter={() => setActiveDropdown(key)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <a className="nav-link nav-link-dd">
                                {label}
                                <svg className={`dd-arrow ${activeDropdown === key ? 'open' : ''}`} width="12" height="7" viewBox="0 0 12 7" fill="none">
                                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <div className="nav-dropdown">
                                <div className="nav-dropdown-inner">
                                    <div className="dd-col dd-links">
                                        <ul>
                                            {items.map((item) => (
                                                <li key={item.title}>
                                                    <Link to={item.href} className="dd-link">
                                                        <span className="dd-link-icon">{item.icon}</span>
                                                        <div>
                                                            <strong>{item.title}</strong>
                                                            <span>{item.desc}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <span className="nav-greeting">
                                <strong>{user.displayName || user.email?.split('@')[0] || '사용자'}</strong>님, 오늘 하루는 어떠셨나요?
                            </span>
                            <Link to="/dashboard" className="nav-login">대시보드</Link>
                            <button className="btn btn-dark" onClick={handleLogout}>로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-login">로그인</Link>
                            <Link to="/signup" className="btn btn-dark">무료로 시작하기</Link>
                        </>
                    )}
                </div>

                <button
                    className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="메뉴"
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    );
}
