import { Link } from 'react-router-dom';
import RevealWrapper from '../../components/common/RevealWrapper';
import './CTA.css';

export default function CTASection() {
    return (
        <section className="cta-banner">
            <div className="container">
                <RevealWrapper><h2 className="cta-title">지금 바로 시작하세요</h2></RevealWrapper>
                <RevealWrapper delay={0.12}>
                    <p className="cta-sub">내 스크린 타임 화면을 올리고, AI의 맞춤형 조언을 바로 확인해보세요.</p>
                </RevealWrapper>
                <RevealWrapper delay={0.24}>
                    <Link to="/signup" className="btn btn-dark">무료로 시작하기</Link>
                </RevealWrapper>
            </div>
        </section>
    );
}
