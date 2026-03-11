import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { getPlantData, updatePlantData } from '../../services/firestore';
import { isExtensionInstalled, getExtensionTodayData, calculatePlantGrowth } from '../../services/extension';
import type { PlantData } from '../../services/firestore';
import type { ExtensionTodayData } from '../../services/extension';
import './Garden.css';

// ── 식물 단계 정의 ────────────────────────────────────────────────────────────
const PLANT_STAGES = [
    { level: 0, emoji: '🌰', name: '씨앗', minDetox: 0 },
    { level: 1, emoji: '🌱', name: '새싹', minDetox: 60 },
    { level: 2, emoji: '🪴', name: '화분', minDetox: 180 },
    { level: 3, emoji: '🌿', name: '풀', minDetox: 360 },
    { level: 4, emoji: '🌳', name: '나무', minDetox: 720 },
    { level: 5, emoji: '🌲', name: '큰 나무', minDetox: 1440 },
];

function getStage(totalMinutes: number) {
    for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
        if (totalMinutes >= PLANT_STAGES[i].minDetox) return PLANT_STAGES[i];
    }
    return PLANT_STAGES[0];
}

function getNextStage(totalMinutes: number) {
    const current = getStage(totalMinutes);
    return PLANT_STAGES.find(s => s.level === current.level + 1) || null;
}

function formatTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
}

// ─────────────────────────────────────────────────────────────────────────────
const GardenPage: React.FC = () => {
    const { user } = useAuthStore();

    const [plant, setPlant] = useState<PlantData | null>(null);
    const [extData, setExtData] = useState<ExtensionTodayData | null>(null);
    const [extInstalled, setExtInstalled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [levelUpAnim, setLevelUpAnim] = useState(false);
    const [wateringAnim, setWateringAnim] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── 데이터 로드 ────────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const [plantData, installed] = await Promise.all([
                getPlantData(user.uid),
                isExtensionInstalled(),
            ]);
            setPlant(plantData ?? { level: 0, totalDetoxMinutes: 0, lastUpdated: null as any });
            setExtInstalled(installed);

            if (installed) {
                const data = await getExtensionTodayData();
                setExtData(data);
            }
        } catch (e) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── 물주기 (성장 적용) ─────────────────────────────────────────────────────
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = plant?.wateredAt === todayStr;
    const claimedMinutesToday = isToday ? (plant?.wateredMinutesToday || 0) : 0;

    // 오늘 전체 달성 가능한 성장 시간
    const totalGrowthToday = extData ? calculatePlantGrowth(extData) : 0;
    // 아직 받지 않은 남은 성장 시간
    const growthAvailable = Math.max(0, totalGrowthToday - claimedMinutesToday);

    const handleWater = async () => {
        if (!user || !plant || !extData || wateringAnim || growthAvailable <= 0) return;

        setWateringAnim(true);

        const prevStage = getStage(plant.totalDetoxMinutes);
        const newTotal = plant.totalDetoxMinutes + growthAvailable;
        const newLevel = getStage(newTotal).level;
        const didLevelUp = newLevel > prevStage.level;

        const newPlant: Partial<PlantData> = {
            level: newLevel,
            totalDetoxMinutes: newTotal,
            wateredAt: todayStr,
            wateredMinutesToday: claimedMinutesToday + growthAvailable,
        };

        await updatePlantData(user.uid, newPlant);
        setPlant(prev => prev ? { ...prev, ...newPlant } : prev);

        if (didLevelUp) {
            setTimeout(() => setLevelUpAnim(true), 500);
            setTimeout(() => setLevelUpAnim(false), 3000);
        }

        setTimeout(() => setWateringAnim(false), 1200);
    };

    if (loading) {
        return (
            <div className="garden-page">
                <div className="garden-loading">
                    <div className="garden-spinner" />
                    <p>정원을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const totalMinutes = plant?.totalDetoxMinutes ?? 0;
    const currentStage = getStage(totalMinutes);
    const nextStage = getNextStage(totalMinutes);
    const progressToNext = nextStage
        ? ((totalMinutes - currentStage.minDetox) / (nextStage.minDetox - currentStage.minDetox)) * 100
        : 100;

    return (
        <div className="garden-page">
            {/* ── 레벨업 애니메이션 오버레이 ── */}
            <AnimatePresence>
                {levelUpAnim && (
                    <motion.div
                        className="levelup-overlay"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="levelup-content">
                            <div className="levelup-emoji">{currentStage.emoji}</div>
                            <h2>레벨 업! 🎉</h2>
                            <p>Lv.{currentStage.level} — {currentStage.name}이 되었어요!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 헤더 ── */}
            <motion.div className="garden-header" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="garden-title">🌱 나의 정원</h1>
                <p className="garden-subtitle">디지털 디톡스로 식물을 키우세요</p>
            </motion.div>

            <div className="garden-grid">
                {/* ── 식물 카드 ── */}
                <motion.div
                    className="garden-card plant-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={`plant-display ${wateringAnim ? 'watering' : ''}`}>
                        <motion.div
                            className="plant-emoji-big"
                            animate={wateringAnim ? { scale: [1, 1.3, 0.9, 1.1, 1], y: [0, -20, 5, -10, 0] } : {}}
                            transition={{ duration: 1 }}
                        >
                            {currentStage.emoji}
                        </motion.div>
                        {wateringAnim && (
                            <div className="water-drops">
                                {['💧', '💧', '💧'].map((d, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 0 }}
                                        animate={{ opacity: [0, 1, 0], y: -40 }}
                                        transition={{ delay: i * 0.15, duration: 0.8 }}
                                    >{d}</motion.span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="plant-meta">
                        <div className="plant-level-badge">Lv.{currentStage.level}</div>
                        <h2 className="plant-name">{currentStage.name}</h2>
                        <p className="plant-total">누적 디톡스 {formatTime(totalMinutes)}</p>
                    </div>

                    {/* 다음 레벨 진행 바 */}
                    {nextStage && (
                        <div className="progress-section">
                            <div className="progress-labels">
                                <span>{currentStage.name}</span>
                                <span>{nextStage.name} ({Math.round(progressToNext)}%)</span>
                            </div>
                            <div className="progress-track">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNext}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                />
                            </div>
                            <p className="progress-hint">
                                {formatTime(nextStage.minDetox - totalMinutes)} 더 모으면 <strong>{nextStage.emoji} {nextStage.name}</strong>로 성장해요!
                            </p>
                        </div>
                    )}

                    {!nextStage && (
                        <div className="max-level-badge">🏆 최고 레벨 달성!</div>
                    )}
                </motion.div>

                {/* ── 확장 프로그램 연동 카드 ── */}
                <motion.div
                    className="garden-card extension-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    {extInstalled === false ? (
                        <div className="ext-not-installed">
                            <div className="ext-icon">🔌</div>
                            <h3>확장 프로그램을 연결하세요</h3>
                            <p>Chrome/Edge 확장 프로그램을 설치하면 사이트 사용 시간을 자동으로 추적하고, 목표 달성 시 식물이 성장합니다!</p>
                            <a
                                href="https://offlo-app.web.app/extension"
                                className="btn btn-primary ext-install-btn"
                                target="_blank"
                                rel="noreferrer"
                            >
                                확장 프로그램 설치 →
                            </a>
                        </div>
                    ) : extData ? (
                        <div className="ext-connected">
                            <div className="ext-header-row">
                                <span className="ext-connected-badge">✅ 확장 연결됨</span>
                                {extData.streak > 0 && (
                                    <span className="streak-pill">🔥 {extData.streak}일 연속</span>
                                )}
                            </div>
                            <div className="ext-stats">
                                <div className="ext-stat">
                                    <div className="ext-stat-value">{extData.achievedCount}/{extData.totalCount}</div>
                                    <div className="ext-stat-label">오늘 목표 달성</div>
                                </div>
                                <div className="ext-stat">
                                    <div className="ext-stat-value">{formatTime(extData.totalSavedMinutes)}</div>
                                    <div className="ext-stat-label">오늘 절약 시간</div>
                                </div>
                            </div>

                            {/* 사이트별 현황 */}
                            <div className="site-stats">
                                {extData.siteStats.map(s => (
                                    <div key={s.domain} className={`site-stat-row ${s.achieved ? 'achieved' : 'over'}`}>
                                        <span className="site-domain">{s.domain}</span>
                                        <span className="site-status">{s.achieved ? '✅' : '❌'}</span>
                                        <span className="site-time">{formatTime(s.usedMinutes)}/{formatTime(s.limitMinutes)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 물주기 버튼 — 추가 디톡스 발생 시 여러 번 가능 */}
                            {growthAvailable > 0 ? (
                                <button
                                    className="btn btn-primary water-btn"
                                    onClick={handleWater}
                                    disabled={wateringAnim}
                                >
                                    💧 식물에게 물 주기 (+{formatTime(growthAvailable)})
                                </button>
                            ) : totalGrowthToday > 0 ? (
                                <div className="water-hint">
                                    ✅ 오늘 모은 디톡스 시간은 모두 줬어요! 추가 디톡스 완료 시 다시 줄 수 있습니다.
                                </div>
                            ) : (
                                <div className="water-hint">
                                    차단 설정 후 시간이 쌓이면 물을 줄 수 있어요!
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="ext-loading">확장 프로그램 데이터 로드 중...</div>
                    )}
                </motion.div>

                {/* ── 성장 단계 로드맵 ── */}
                <motion.div
                    className="garden-card roadmap-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card-section-title">성장 단계</div>
                    <div className="roadmap">
                        {PLANT_STAGES.map(stage => {
                            const isUnlocked = totalMinutes >= stage.minDetox;
                            const isCurrent = stage.level === currentStage.level;
                            return (
                                <div key={stage.level} className={`roadmap-step ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}>
                                    <div className="roadmap-emoji">{stage.emoji}</div>
                                    <div className="roadmap-info">
                                        <div className="roadmap-name">Lv.{stage.level} {stage.name}</div>
                                        <div className="roadmap-req">{formatTime(stage.minDetox)} 달성 시</div>
                                    </div>
                                    {isCurrent && <div className="roadmap-current-dot" />}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {error && <div className="garden-error">{error}</div>}
        </div>
    );
};

export default GardenPage;
