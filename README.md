# 🌿 Offlo (오플로)

> **디지털 중독에서 벗어나, 나만의 온전한 흐름을 찾다.**
> 
> "Off + Flow" — 스마트폰을 껐을 때(Off), 비로소 진정한 내 삶의 흐름(Flow)이 시작된다는 의미를 담은 디지털 디톡스 플랫폼입니다.

https://offlo-app.web.app/      ||     링크를 눌러 웹 페이지를 확인하실 수 있어요.
---

## 📖 프로젝트 소개

**Offlo**는 현대인의 스마트폰 과의존 문제를 해결하기 위해 기획된 디지털 웰니스(Digital Wellness) 웹 애플리케이션입니다. 

복잡한 연동 과정 없이 **내 스마트폰의 스크린 타임 화면을 캡처해서 올리기만 하면**, AI가 사용 패턴을 분석하여 맞춤형 디톡스 솔루션을 제안합니다. 또한, 목표를 달성할 때마다 나만의 '반려 식물'이 자라나는 게이미피케이션(Gamification) 요소를 도입하여 즐겁고 지속 가능한 습관 형성을 돕습니다.

### ✨ 주요 기능
- **📸 스크린 타임 AI 분석**: 스크린 타임 캡처 이미지(캡처본)를 업로드하면 AI(Gemini Vision API)가 앱별 사용량을 추출하고 취약점을 분석합니다.
- **🌱 반려 식물 키우기 (게이미피케이션)**: 설정한 디톡스 목표(예: 인스타그램 사용 1시간 이하)를 달성하면 식물이 성장하고 새로운 칭호(배지)를 획득합니다.
- **📊 디톡스 현황 대시보드**: 주간/월간 스크린 타임 변화 추이와 달성률을 한눈에 파악할 수 있습니다.
- **🔐 간편하고 안전한 인증**: Firebase를 활용한 이메일 및 Google 소셜 로그인을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Styling & Animation**: Vanilla CSS (Global Design Token System) + [Framer Motion](https://www.framer.com/motion/)

### Backend (BaaS) & AI
- **Database & Auth**: [Google Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Cloud Storage)
- **AI Integration**: Google Gemini Vision API (Cloud Functions 연동 예정)

---

## 🚀 프로젝트 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위한 방법입니다.

### 1. 요구 사항 (Prerequisites)
- [Node.js](https://nodejs.org/) (v20 이상 권장)
- npm 혹은 yarn

### 2. 설치 및 실행
```bash
# 1. 레포지토리 클론
git clone https://github.com/DayGoProject/Offlo.git

# 2. 웹 프로젝트 폴더로 이동
cd offlo/web

# 3. 패키지 설치
npm install

# 4. 환경 변수 설정
# web 폴더 내에 `.env.local` 파일을 생성하고 Firebase 설정값을 기입합니다.
# (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN 등)

# 5. 개발 서버 실행
npm run dev
```
개발 서버가 실행되면 웹 브라우저에서 `http://localhost:5173` 으로 접속하여 확인할 수 있습니다.

---

## 📂 폴더 구조 (Directory Structure)

```text
web/
├── public/                 # 정적 리소스 (favicon, images 등)
└── src/
    ├── components/         # 공통 컴포넌트 (UI, Layout 등)
    ├── hooks/              # 커스텀 React Hooks
    ├── pages/              # 라우팅 단위의 페이지 컴포넌트
    ├── services/           # 외부 API 및 Firebase 통신 로직
    ├── store/              # Zustand 전역 상태 스토어
    ├── types/              # TypeScript 타입 및 인터페이스 정의
    ├── utils/              # 유틸리티 함수
    ├── App.tsx             # 최상위 라우팅 및 레이아웃 설정
    └── main.tsx            # React 앱 진입점
```

---

## 📝 라이선스 (License)

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.
