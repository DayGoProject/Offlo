import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Mock data for initial UI building
    const [todayDetoxMinutes] = useState(0);
    const [targetMinutes] = useState(120);

    const progressPercentage = Math.min((todayDetoxMinutes / targetMinutes) * 100, 100);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <motion.h1
                    className="dashboard-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    환영합니다, {user?.displayName || '사용자'} 님 👋
                </motion.h1>
                <p className="dashboard-subtitle">오늘도 건강한 디지털 습관을 만들어가요.</p>
            </div>

            <div className="dashboard-grid">
                {/* Today's Summary Card */}
                <motion.div
                    className="dashboard-card summary-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h3>오늘의 디톡스 상태</h3>
                    <div className="progress-section">
                        <div className="progress-labels">
                            <span>진행률</span>
                            <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <motion.div
                                className="progress-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            />
                        </div>
                        <p className="target-text">목표: {targetMinutes}분 중 {todayDetoxMinutes}분 달성</p>
                    </div>

                    <button className="btn btn-primary btn-full-width mt-6" onClick={() => navigate('/analysis')}>
                        스크린 타임 인증하기
                    </button>
                </motion.div>

                {/* Garden Placeholder Card */}
                <motion.div
                    className="dashboard-card garden-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3>🌱 나의 정원</h3>
                    <div className="garden-placeholder">
                        <div className="plant-image-mock">
                            🪴
                        </div>
                        <p>아직 씨앗 상태입니다.<br />디톡스 목표를 달성해 식물을 키워보세요!</p>
                    </div>
                </motion.div>

                {/* Recent Analysis Placeholder */}
                <motion.div
                    className="dashboard-card history-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3>최근 분석 기록</h3>
                    <div className="empty-state">
                        <p>아직 등록된 스크린 타임 분석 기록이 없습니다.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;
