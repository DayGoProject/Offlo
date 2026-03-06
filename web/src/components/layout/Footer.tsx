import { Link } from 'react-router-dom';
import './Footer.css';

const footerCols = [
    {
        heading: '제품',
        links: ['기능 소개', '요금제', '기업용', '다운로드'],
        hrefs: ['/#features', '/pricing', '/pricing', '#'],
    },
    {
        heading: '리소스',
        links: ['블로그', '연구 자료', '자주 묻는 질문', '커뮤니티'],
        hrefs: ['#', '#', '#', '#'],
    },
    {
        heading: '회사',
        links: ['소개', '채용', '파트너십', '문의'],
        hrefs: ['#', '#', '#', '#'],
    },
    {
        heading: '법적 고지',
        links: ['이용약관', '개인정보처리방침', '쿠키 정책'],
        hrefs: ['#', '#', '#'],
    },
];

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-brand">
                    <Link to="/" className="nav-logo">
                        <img src="/logo.png" alt="Offlo" className="nav-logo-img" />
                    </Link>
                    <p className="footer-tagline">건강한 디지털 습관을<br />만들어 드립니다.</p>
                </div>
                {footerCols.map((col) => (
                    <div className="footer-col" key={col.heading}>
                        <h4 className="footer-heading">{col.heading}</h4>
                        <ul>
                            {col.links.map((link, i) => (
                                <li key={link}><Link to={col.hrefs[i]}>{link}</Link></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="footer-bottom">
                <p>© 2026 Offlo. All rights reserved.</p>
            </div>
        </footer>
    );
}
