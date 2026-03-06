import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
    const [visible, setVisible] = useState(true);
    const { user } = useAuthStore();

    if (!visible || user) return null;
    return (
        <div className="announcement-bar">
            <span>✦ 2,000명이 첫 주에 스크린 타임을 40% 줄였습니다.</span>
            <a href="/signup" className="announcement-link">지금 시작하기 →</a>
            <button className="announcement-close" onClick={() => setVisible(false)} aria-label="닫기">✕</button>
        </div>
    );
}
