import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalysisStore } from '../../store/analysisStore';
import './AnalysisResult.css';

const AnalysisResultPage: React.FC = () => {
    const navigate = useNavigate();
    const { analysisResult, previewUrl, clearAnalysis } = useAnalysisStore();

    useEffect(() => {
        if (!analysisResult) {
            navigate('/analysis');
        }
    }, [analysisResult, navigate]);

    if (!analysisResult) return null;

    const handleRestart = () => {
        clearAnalysis();
        navigate('/analysis');
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
    };

    return (
        <div className="analysis-result-container">
            <motion.div
                className="result-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>AI 분석 결과</h1>
                <p className="ai-advice">"{analysisResult.advice}"</p>
            </motion.div>

            <div className="result-content">
                <motion.div
                    className="result-preview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3>분석한 스크린 타임</h3>
                    {previewUrl && <img src={previewUrl} alt="Analyzed Screen" />}
                </motion.div>

                <motion.div
                    className="result-stats"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-card highlight">
                        <h3>총 사용 시간</h3>
                        <div className="stat-value">{formatTime(analysisResult.totalMinutes)}</div>
                    </div>

                    <div className="app-list-card">
                        <h3>가장 많이 사용한 앱</h3>
                        <ul className="app-list">
                            {analysisResult.apps.map((app: any, index: number) => (
                                <li key={index}>
                                    <span className="app-rank">{index + 1}</span>
                                    <span className="app-name">{app.name}</span>
                                    <span className="app-time">{formatTime(app.minutes)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="result-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <button className="btn btn-primary" onClick={handleRestart}>새로운 분석하기</button>
                <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>대시보드로 가기</button>
            </motion.div>
        </div>
    );
};

export default AnalysisResultPage;
