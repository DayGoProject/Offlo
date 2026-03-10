import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { getRecentAnalyses, getWeeklyAnalyses, getPlantData } from '../../services/firestore';
import type { AnalysisRecord, PlantData } from '../../services/firestore';
import './Dashboard.css';

// ── 유틸 ──────────────────────────────────────────────────
const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatDate = (ts: any): string => {
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getPlantEmoji = (level: number) => {
    if (level >= 5) return '🌳';
    if (level >= 3) return '🌿';
    if (level >= 1) return '🌱';
    return '🌰';
};

const getPlantLabel = (level: number) => {
    if (level >= 5) return '나무';
    if (level >= 3) return '새싹';
    if (level >= 1) return '싹';
    return '씨앗';
};

// ── 컴포넌트 ─────────────────────────────────────────────
const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
    const [weeklyData, setWeeklyData] = useState<{ date: string; minutes: number }[]>([]);
    const [plant, setPlant] = useState<PlantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [todayRecord, setTodayRecord] = useState<AnalysisRecord | null>(null);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [recent, weekly, plantData] = await Promise.all([
                getRecentAnalyses(user.uid, 5),
                getWeeklyAnalyses(user.uid),
                getPlantData(user.uid),
            ]);

            setAnalyses(recent);
            setPlant(plantData);

            // 오늘 날짜 기록 찾기
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
            const todayRec = recent.find(r => {
                const ts = r.createdAt;
                const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date();
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayStr;
            });
            setTodayRecord(todayRec || null);

            // 주간 차트 데이터 빌드 (최근 7일 역순)
            const chartData = weekly.slice().reverse().map(r => ({
                date: formatDate(r.createdAt),
                minutes: r.result?.totalMinutes || 0,
            }));
            setWeeklyData(chartData);
        } catch (e) {
            console.error('Dashboard data load error:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dash-spinner" />
                <p>데이터를 불러오는 중...</p>
            </div>
        );
    }

    const plantLevel = plant?.level ?? 0;
    const totalDetox = plant?.totalDetoxMinutes ?? 0;

    return (
        <div className="dashboard-page">
            {/* ── 헤더 ── */}
            <motion.div
                className="dash-header"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div>
                    <h1 className="dash-greeting">
                        안녕하세요, <span>{user?.displayName?.split(' ')[0] || '님'}</span> 👋
                    </h1>
                    <p className="dash-subtext">오늘도 건강한 디지털 습관을 만들어가요.</p>
                </div>
                <button className="btn btn-primary dash-cta-btn" onClick={() => navigate('/analysis')}>
                    📸 분석 시작하기
                </button>
            </motion.div>

            {/* ── 그리드 ── */}
            <div className="dash-grid">

                {/* 오늘의 현황 카드 */}
                <motion.div
                    className="dash-card card-today"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-label">오늘의 스크린 타임</div>
                    {todayRecord ? (
                        <>
                            <div className="today-time">
                                {formatTime(todayRecord.result.totalMinutes)}
                            </div>
                            <div className="today-advice">💡 {todayRecord.result.advice}</div>
                            <div className="today-apps">
                                {todayRecord.result.apps.slice(0, 3).map((app, i) => (
                                    <div key={i} className="app-chip">
                                        <span className="app-chip-name">{app.name}</span>
                                        <span className="app-chip-time">{formatTime(app.minutes)}</span>
                                        <div
                                            className="app-chip-bar"
                                            style={{
                                                width: `${Math.min((app.minutes / todayRecord.result.totalMinutes) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="today-empty">
                            <div className="today-empty-icon">📱</div>
                            <p>오늘 아직 분석하지 않았어요.</p>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/analysis')}>
                                지금 분석하기
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* 나의 정원 카드 */}
                <motion.div
                    className="dash-card card-garden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onClick={() => navigate('/garden')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="card-label">나의 정원</div>
                    <div className="garden-plant-display">
                        <div className="plant-emoji">{getPlantEmoji(plantLevel)}</div>
                        <div className="plant-info">
                            <div className="plant-level">Lv.{plantLevel} — {getPlantLabel(plantLevel)}</div>
                            <div className="plant-detox">누적 디톡스 {formatTime(totalDetox)}</div>
                        </div>
                    </div>
                    <div className="garden-progress-track">
                        <div
                            className="garden-progress-fill"
                            style={{ width: `${Math.min((totalDetox % 120) / 120 * 100, 100)}%` }}
                        />
                    </div>
                    <div className="garden-next-label">
                        다음 레벨까지 {formatTime(120 - (totalDetox % 120))} 남았어요
                    </div>
                </motion.div>

                {/* 주간 차트 카드 */}
                <motion.div
                    className="dash-card card-chart"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card-label">주간 스크린 타임</div>
                    {weeklyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={weeklyData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${Math.round(v / 60)}h`}
                                />
                                <Tooltip
                                    formatter={(v: number | undefined) => [formatTime(v ?? 0), '스크린 타임']}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                                    {weeklyData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={index === weeklyData.length - 1 ? '#D97757' : '#e8c8b5'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">
                            <p>분석 기록이 없습니다.<br />첫 분석을 시작해 보세요!</p>
                        </div>
                    )}
                </motion.div>

                {/* 최근 분석 기록 */}
                <motion.div
                    className="dash-card card-history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="card-label-row">
                        <span className="card-label">최근 분석 기록</span>
                        {analyses.length > 0 && (
                            <button className="link-btn" onClick={() => navigate('/history')}>전체 보기</button>
                        )}
                    </div>
                    {analyses.length > 0 ? (
                        <ul className="history-list">
                            {analyses.map((rec, i) => (
                                <motion.li
                                    key={rec.id}
                                    className="history-item"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.28 + i * 0.05 }}
                                >
                                    <div className="history-date">{formatDate(rec.createdAt)}</div>
                                    <div className="history-main">
                                        <span className="history-time">{formatTime(rec.result?.totalMinutes || 0)}</span>
                                        <span className="history-top-app">
                                            {rec.result?.apps?.[0]?.name || '—'}
                                        </span>
                                    </div>
                                    <div className="history-advice">{rec.result?.advice}</div>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <div className="history-empty">
                            <p>아직 분석 기록이 없습니다.</p>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analysis')}>
                                첫 분석 시작하기 →
                            </button>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
};

export default DashboardPage;
