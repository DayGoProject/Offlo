import { Link } from 'react-router-dom';
import RevealWrapper from '../../components/common/RevealWrapper';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import './Hero.css';

const bars = [
    { app: 'Instagram', pct: 82, color: '#D97757', time: '3h 12m' },
    { app: 'YouTube', pct: 65, color: '#E8916F', time: '2h 33m' },
    { app: 'TikTok', pct: 45, color: '#C05E3A', time: '1h 46m' },
    { app: 'KakaoTalk', pct: 28, color: '#D97757', time: '1h 05m', opacity: 0.5 },
];

export default function HeroSection() {
    const barRefs = useRef<(HTMLDivElement | null)[]>([]);
    const { user } = useAuthStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            barRefs.current.forEach((bar, i) => {
                if (bar) bar.style.width = `${bars[i].pct}%`;
            });
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="hero" id="hero">
            <div className="hero-inner">
                {/* 텍스트 영역 */}
                <div>
                    <RevealWrapper>
                        <span className="section-label">디지털 웰니스 플랫폼</span>
                    </RevealWrapper>
                    <RevealWrapper delay={0.12}>
                        <h1 className="hero-title">
                            디지털 중독에서<br />
                            <em>자유로워지세요</em>
                        </h1>
                    </RevealWrapper>
                    <RevealWrapper delay={0.24}>
                        <p className="hero-sub">
                            내 스마트폰 스크린 타임 화면을 캡처해서 올려주세요.<br />
                            AI가 나의 사용 습관을 분석하고, 나만의 맞춤형 디톡스 솔루션을 제안합니다.
                        </p>
                    </RevealWrapper>
                    <RevealWrapper delay={0.36}>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/dashboard" className="btn btn-primary">대시보드로 가기</Link>
                            ) : (
                                <Link to="/signup" className="btn btn-primary">무료로 시작하기</Link>
                            )}
                            <a href="#features" className="btn btn-ghost">더 알아보기</a>
                        </div>
                    </RevealWrapper>
                </div>

                {/* 데모 카드 */}
                <RevealWrapper delay={0.24} className="hero-visual">
                    <div className="hero-card">
                        <div className="card-header">
                            <span className="card-dot red" />
                            <span className="card-dot yellow" />
                            <span className="card-dot green" />
                            <span className="card-title-small">오늘의 스크린 타임</span>
                        </div>
                        <div className="card-body">
                            <div className="screen-bar-list">
                                {bars.map((b, i) => (
                                    <div className="screen-bar-item" key={b.app}>
                                        <span className="app-name">{b.app}</span>
                                        <div className="bar-wrap">
                                            <div
                                                ref={(el) => { barRefs.current[i] = el; }}
                                                className="bar"
                                                style={{ width: 0, background: b.color, opacity: b.opacity ?? 1 }}
                                            />
                                        </div>
                                        <span className="app-time">{b.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="card-total">
                                <span>총 스크린 타임</span>
                                <strong>8h 36m</strong>
                            </div>
                            <div className="card-badge">⚠️ 목표보다 3시간 초과</div>
                        </div>
                    </div>
                </RevealWrapper>
            </div>
        </section>
    );
}
