import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAnalysisStore } from '../../store/analysisStore';
import './Analysis.css';

const AnalysisPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { selectedImage, previewUrl, setSelectedImage, clearAnalysis } = useAnalysisStore();

    // 로컬 상태 (드래그 전용)
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 마운트 시 기존 상태 초기화
    useEffect(() => {
        clearAnalysis();
    }, [clearAnalysis]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setSelectedImage(file, url);
        } else {
            alert('이미지 파일만 업로드 가능합니다.');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancel = () => {
        clearAnalysis();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = () => {
        if (!selectedImage || !user) return;
        navigate('/analysis/loading');
    };

    return (
        <div className="analysis-container">
            <div className="analysis-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    &larr; 돌아가기
                </button>
                <motion.h1
                    className="analysis-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    스크린 타임 분석하기
                </motion.h1>
                <p className="analysis-subtitle">스마트폰의 스크린 타임 화면을 캡처해 올려주세요. AI가 생활 습관을 분석해 드립니다.</p>
            </div>

            <motion.div
                className="upload-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                {!previewUrl ? (
                    <div
                        className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleUploadClick}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden-input"
                        />
                        <div className="upload-icon">📸</div>
                        <h3>이곳을 클릭하거나 이미지를 드래그하세요</h3>
                        <p>지원 양식: JPG, PNG, WEBP (최대 5MB)</p>
                    </div>
                ) : (
                    <div className="preview-container">
                        <div className="image-wrapper">
                            <img src={previewUrl} alt="Screen Time Preview" className="preview-image" />
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-ghost"
                                onClick={handleCancel}
                            >
                                다시 선택하기
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAnalyze}
                            >
                                분석 시작하기
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AnalysisPage;
