import { Link } from 'react-router-dom';
import RevealWrapper from '../../components/common/RevealWrapper';
import { useAuthStore } from '../../store/authStore';
import './CTA.css';

export default function CTASection() {
    const { user } = useAuthStore();

    return (
        <section className="cta-banner">
            <div className="container">
                <RevealWrapper><h2 className="cta-title">지금 바로 시작하세요</h2></RevealWrapper>
                <RevealWrapper delay={0.12}>
                    <p className="cta-sub">내 스크린 타임 화면을 올리고, AI의 맞춤형 조언을 바로 확인해보세요.</p>
                </RevealWrapper>
                <RevealWrapper delay={0.24}>
                    {user ? (
                        <Link to="/dashboard" className="btn btn-dark">대시보드로 가기</Link>
                    ) : (
                        <Link to="/signup" className="btn btn-dark">무료로 시작하기</Link>
                    )}
                </RevealWrapper>
            </div>
        </section>
    );
}
