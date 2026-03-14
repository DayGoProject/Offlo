# 🌿 Offlo (오플로)

> **디지털 중독에서 벗어나, 나만의 온전한 흐름을 찾다.**
> 
> "Off + Flow" — 스마트폰을 껐을 때(Off), 비로소 진정한 내 삶의 흐름(Flow)이 시작된다는 의미를 담은 디지털 디톡스 플랫폼입니다.
---

## 📖 프로젝트 소개

**Offlo**는 현대인의 스마트폰 및 인터넷 과의존 문제를 해결하기 위해 기획된 디지털 웰니스(Digital Wellness) 서비스입니다. 

웹 애플리케이션과 크롬/엣지 확장 프로그램을 연동하여, 사용자의 스마트폰 및 PC 사용 습관을 전방위로 관리할 수 있습니다. 
내 스마트폰의 스크린 타임 화면을 캡처해서 웹에 올리면 AI가 사용 패턴을 분석해 주고, PC 확장 프로그램에서는 불필요한 웹사이트의 사용 시간을 제한할 수 있습니다. 
목표를 달성할 때마다 나만의 '반려 식물'이 자라나는 게이미피케이션(Gamification) 요소로 즐겁게 디지털 디톡스 습관을 형성하세요.

### ✨ 주요 기능
- **📸 스마트폰 스크린 타임 AI 분석 (Web)**: 스크린 타임 캡처 이미지를 업로드하면 Google Gemini Vision API를 연동한 Cloud Functions가 앱별 사용량을 추출하고 취약점 및 개선 조언을 제공합니다.
- **🛡️ 웹사이트 차단 및 관리 (Extension)**: Chrome/Edge 확장 프로그램을 통해 사이트별 사용 제한 시간을 설정하고, 제한 시간이 초과되면 접근을 차단합니다.
- **🌱 반려 식물 키우기 (게이미피케이션)**: 웹과 익스텐션에서 디톡스 목표(예: 인스타그램 1시간 이하 사용)를 달성하면 정원(Garden)의 식물이 성장하고 새로운 칭호(배지)를 획득합니다.
- **📊 디톡스 현황 대시보드**: 주간/월간 스크린 타임 변화 추이와 달성률을 한눈에 파악할 수 있는 사용자 대시보드를 제공합니다.
- **🔐 간편하고 안전한 인증**: Firebase Authentication을 활용한 이메일 및 Google 소셜 로그인 지원.
- **📑 통합 정보 페이지**: 서비스 소개(About), 자주 묻는 질문(FAQ), 개인정보처리방침(Privacy), 이용약관(Terms) 등 상세한 푸터(Footer) 페이지 구성을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend (Main Web App)
- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Styling & Animation**: Vanilla CSS (Global Design Token System) + [Framer Motion](https://www.framer.com/motion/)

### Frontend (Chrome Extension)
- **Manifest**: Chrome Manifest V3
- **Language**: JavaScript (Modular approach)
- **Communication**: Service Worker & Message Passing, Externally Connectable API 연동

### Backend (BaaS) & AI
- **Database & Auth**: [Google Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Cloud Storage, Hosting)
- **Serverless functions**: Firebase Cloud Functions (Gen 2, Node.js)
- **AI Integration**: Google Gemini 2.5 Flash Vision API

---

## 🚀 프로젝트 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위한 방법입니다.

### 1. 요구 사항 (Prerequisites)
- [Node.js](https://nodejs.org/) (v20 이상 권장)
- npm 혹은 yarn

### 2. 웹 앱 설치 및 실행
```bash
# 1. 레포지토리 클론
git clone https://github.com/DayGoProject/Offlo.git

# 2. 웹 프로젝트 폴더로 이동
cd Offlo/web

# 3. 패키지 설치
npm install

# 4. 환경 변수 설정
# web 폴더 내에 `.env.local` 파일을 생성하고 Firebase 환경 설정 값을 기입합니다.

# 5. 개발 서버 실행
npm run dev
```

### 3. 클라우드 함수(Cloud Functions) 배포
```bash
cd Offlo/functions
npm install
# functions 폴더 내에 `.env` 파일을 생성하고 `GEMINI_API_KEY` 값을 기입합니다.
npm run build
firebase deploy --only functions
```

### 4. 확장 프로그램(Extension) 설치 절차
1. Chromium 기반 브라우저(Chrome, Edge 등)에서 확장 프로그램 관리 페이지(`chrome://extensions`)로 접속합니다.
2. 우측 상단의 **'개발자 모드(Developer mode)'**를 켭니다.
3. 좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다(Load unpacked)'** 버튼을 클릭합니다.
4. 소스 코드의 `Offlo/extension` 폴더를 선택하여 불러옵니다.

---

## 📂 폴더 구조 (Directory Structure)

```text
Offlo/
├── extension/              # Chrome/Edge 확장 프로그램 소스
│   ├── background.js       # 서비스 워커
│   ├── popup.html/css/js   # 익스텐션 팝업 UI 및 로직
│   └── manifest.json       # 익스텐션 설정 파일
├── functions/              # Firebase Cloud Functions 소스 (AI 연동)
│   └── src/
│       ├── index.ts        # 함수 엔트리 포인트
│       └── gemini.ts       # Gemini Vision API 처리 로직
├── web/                    # 메인 React 웹 애플리케이션
│   ├── public/             # 정적 리소스
│   └── src/
│       ├── components/     # UI, Layout 공통 컴포넌트
│       ├── pages/          # 대시보드, 랜딩, 푸터 정보 페이지 등
│       ├── services/       # Firebase 연동 로직
│       ├── store/          # 상태 관리 (Zustand)
│       └── App.tsx         # 전체 라우팅
├── firebase.json           # Firebase 배포 및 룰 설정 가이드
```

---

## 📝 라이선스 (License)

이 프로젝트의 소스 코드는 공개되어 있으나, **상업적 이용 및 무단 배포를 엄격히 금지합니다.**
자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
