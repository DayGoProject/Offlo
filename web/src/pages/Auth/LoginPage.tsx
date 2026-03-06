import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle } from '../../services/auth';
import './Auth.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await loginWithEmail(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            if (err.message && err.message.includes('이메일 인증')) {
                setError(err.message);
            } else {
                setError('이메일 또는 비밀번호를 확인해주세요.');
            }
        } finally { setLoading(false); }
    };

    const handleGoogle = async () => {
        setError(''); setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch {
            setError('Google 로그인에 실패했습니다.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/logo.png" alt="Offlo" className="auth-logo-img" />
                </div>
                <h1 className="auth-title">다시 오셨군요!</h1>
                <p className="auth-sub">디지털 디톡스를 계속해볼까요?</p>

                <button className="btn-social" onClick={handleGoogle} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.7 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.3C29.3 35.3 26.7 36 24 36c-5.3 0-9.6-2.9-11.3-7.1l-6.6 5.1C9.8 39.7 16.4 44 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.3C43 35 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" /></svg>
                    Google로 계속하기
                </button>

                <div className="auth-divider"><span>또는</span></div>

                <form onSubmit={handleEmail} className="auth-form">
                    <div className="form-group">
                        <label>이메일</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="hello@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="비밀번호 입력" required />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <p className="auth-switch">
                    계정이 없으신가요? <Link to="/signup">무료로 시작하기</Link>
                </p>
            </div>
        </div>
    );
}
