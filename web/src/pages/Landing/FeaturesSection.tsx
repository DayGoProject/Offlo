import { Link } from 'react-router-dom';
import RevealWrapper from '../../components/common/RevealWrapper';
import './Features.css';

export default function FeaturesSection() {
    return (
        <>
            {/* Feature 1 — 스크린샷 업로드 */}
            <section className="feature" id="features">
                <div className="container feature-grid">
                    <RevealWrapper className="feature-text">
                        <span className="section-label">캡처 업로드</span>
                        <h2 className="feature-title">스크린 타임 캡처본을<br />그대로 올려주세요</h2>
                        <p className="feature-desc">
                            번거로운 연동 과정은 필요 없습니다. 스마트폰의 내 스크린 타임 화면이나
                            자주 쓰는 앱의 사용 시간 화면을 캡처해서 업로드하기만 하세요.
                            AI가 이미지를 인식하여 데이터를 추출합니다.
                        </p>
                        <Link to="/analysis" className="btn btn-primary">사진 업로드하기</Link>
                    </RevealWrapper>

                    <RevealWrapper delay={0.12} className="feature-visual">
                        <div className="feature-card upload-card">
                            <div className="upload-area">
                                <span className="upload-icon">📸</span>
                                <p><strong>클릭</strong>하여 이미지를 선택하거나<br />여기로 드래그 앤 드롭 하세요</p>
                                <span className="upload-hint">지원: JPG, PNG (최대 10MB)</span>
                            </div>
                        </div>
                    </RevealWrapper>
                </div>
            </section>

            {/* Feature 2 — 반려 식물 게이미피케이션 */}
            <section className="feature feature-alt" id="how">
                <div className="container feature-grid feature-grid-reverse">
                    <RevealWrapper className="feature-visual">
                        <div className="feature-card gamification-card">
                            <div className="badge-header">
                                <span className="badge-icon">🥉</span>
                                <div className="badge-info">
                                    <span className="badge-subtitle">현재 호칭</span>
                                    <strong className="badge-title">스마트폰 노예 탈출중</strong>
                                </div>
                            </div>

                            <div className="plant-display">
                                <div className="plant-stage">
                                    <span className="plant-emoji">🌱</span>
                                </div>
                                <p className="plant-message">"조금만 더 버티면 한 단계 자랄 거예요!"</p>
                            </div>

                            <div className="xp-progress">
                                <div className="xp-labels">
                                    <span className="xp-current">경험치 80%</span>
                                    <span className="xp-next">다음: 🥈 현생 복귀자</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '80%' }} />
                                </div>
                            </div>

                            <button className="btn btn-dark share-btn">
                                <span>📸</span> 인스타그램 스토리에 자랑하기
                            </button>
                        </div>
                    </RevealWrapper>

                    <RevealWrapper delay={0.12} className="feature-text">
                        <span className="section-label">확실한 보상</span>
                        <h2 className="feature-title">화면을 끈 시간만큼,<br />나만의 식물이 자라납니다</h2>
                        <p className="feature-desc">
                            목표를 달성하고 사진을 인증하면 식물이 영양분을 얻어 자라납니다.
                            특정 단계에 도달할 때마다 특별한 칭호 배지가 해금됩니다.
                            재밌는 칭호를 얻고 친구들에게 나의 '현생 복귀'를 자랑해보세요!
                        </p>
                        <Link to="/garden" className="btn btn-primary">식물 키우기 시작</Link>
                    </RevealWrapper>
                </div>
            </section>
        </>
    );
}
