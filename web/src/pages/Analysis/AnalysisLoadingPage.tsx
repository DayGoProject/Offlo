import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { storage, functions } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { useAnalysisStore } from '../../store/analysisStore';
import './AnalysisLoading.css';

const AnalysisLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { selectedImage, setAnalysisResult } = useAnalysisStore();
    const [progressText, setProgressText] = useState('이미지 서버 전송 중...');

    useEffect(() => {
        if (!selectedImage || !user) {
            navigate('/analysis');
            return;
        }

        const runAnalysis = async () => {
            try {
                // 1. Upload to Storage
                const fileName = `${Date.now()}_${selectedImage.name}`;
                const filePath = `users/${user.uid}/analyses/${fileName}`;
                const fileRef = ref(storage, filePath);
                await uploadBytes(fileRef, selectedImage);

                // 2. Call Cloud Function
                setProgressText('AI가 생활 패턴을 분석하고 있습니다...');
                const analyzeScreenTime = httpsCallable(functions, 'analyzeScreenTime');
                const result = await analyzeScreenTime({ filePath });

                const data: any = result.data;
                if (data.success) {
                    setAnalysisResult(data.data);
                    // Navigate to Result
                    navigate('/analysis/result');
                } else {
                    throw new Error("분석이 실패했습니다.");
                }
            } catch (error) {
                console.error('Analysis failed:', error);
                alert('업로드 또는 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
                navigate('/analysis');
            }
        };

        runAnalysis();
    }, [selectedImage, user, navigate, setAnalysisResult]);

    return (
        <div className="analysis-loading-container">
            <motion.div
                className="loading-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="spinner">
                    <div className="double-bounce1"></div>
                    <div className="double-bounce2"></div>
                </div>
                <h2>분석 중...</h2>
                <p>{progressText}</p>
                <p className="loading-tip">"작은 습관의 변화가 더 나은 내일을 만듭니다."</p>
            </motion.div>
        </div>
    );
};

export default AnalysisLoadingPage;
