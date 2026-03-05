import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RevealWrapper from '../../components/common/RevealWrapper';
import './Stats.css';

interface StatItem {
    target: number;
    unit: string;
    desc: string;
}

const stats: StatItem[] = [
    { target: 87, unit: '%', desc: '스크린 타임\n30% 이상 감소' },
    { target: 3, unit: '.2×', desc: '수면의 질\n개선 효과' },
    { target: 94, unit: '%', desc: '집중력\n향상 경험' },
];

function useCounter(target: number, duration = 2000, active: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration, active]);
    return count;
}

function StatCard({ target, unit, desc, delay }: StatItem & { delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const count = useCounter(target, 2000, active);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <RevealWrapper delay={delay}>
            <div className="stat-item" ref={ref}>
                <div className="stat-number-wrap">
                    <span className="stat-number">{count}</span>
                    <span className="stat-unit">{unit}</span>
                </div>
                <p className="stat-desc">{desc.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>
            </div>
        </RevealWrapper>
    );
}

export default function StatsSection() {
    return (
        <section className="stats" id="stats">
            <div className="container">
                <RevealWrapper><h2 className="section-title">Offlo와 함께라면</h2></RevealWrapper>
                <RevealWrapper delay={0.12}><p className="section-sub">Offlo를 사용한 이용자들의 실제 결과입니다</p></RevealWrapper>
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <StatCard key={s.desc} {...s} delay={i * 0.12} />
                    ))}
                </div>
                <RevealWrapper delay={0.36}>
                    <div className="stats-cta">
                        <Link to="/pricing" className="btn btn-dark">플랜 보기</Link>
                    </div>
                </RevealWrapper>
            </div>
        </section>
    );
}
