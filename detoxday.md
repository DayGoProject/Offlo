# DetoxDay — Antigravity 프로젝트 시작 프롬프트

---

## 프로젝트 개요

**DetoxDay**는 스마트폰 스크린타임을 줄이고 건강한 디지털 습관을 형성하도록 돕는 디지털 디톡스 플랫폼이야.
완전히 새로운 프로젝트로, 새 폴더를 만들어 처음부터 시작한다.

### 핵심 기능
1. **AI 스크린타임 분석** — 사용자가 스마트폰 스크린타임 스크린샷을 업로드하면 Gemini 2.5 Flash가 사용 패턴을 분석하고 개선 방향을 제안
2. **반려 식물 게이미피케이션** — 화면을 끈 시간(디톡스 시간)만큼 가상의 반려 식물이 성장
3. **뱃지 & 칭호 시스템** — 특정 목표 달성 시 뱃지와 칭호 부여, 인스타그램 스토리 등 SNS 공유 가능
4. **목표 설정** — 사용자가 직접 디지털 디톡스 목표를 설정하고 진행 현황 추적
5. **프리미엄 구독** — 무료 사용자는 텍스트 분석만, 결제 사용자는 그래프/차트 포함 상세 분석 제공

---

## 개발 순서

**웹을 먼저 완성한 뒤 앱을 개발한다.**
웹과 앱은 같은 Firebase를 공유해서 어디서 로그인하든 데이터가 완전히 동기화돼야 해.

---

## 기술 스택

### 웹 (먼저 개발)

| 역할 | 기술 |
|---|---|
| 프레임워크 | React + Vite + TypeScript |
| 스타일링 | 미확정 (추후 결정) |
| 애니메이션 | 미확정 (추후 결정) |
| 상태관리 | Zustand |
| 인증 | Firebase Authentication |
| DB | Firebase Firestore |
| 이미지 저장 | Firebase Storage |
| 서버 로직 | Firebase Cloud Functions (Node.js + TypeScript) |
| AI 분석 | Gemini 2.5 Flash API (Cloud Functions에서만 호출) |
| 결제 | PayPal (웹에서만) |

### 앱 (웹 완성 후 개발)

| 역할 | 기술 |
|---|---|
| 프레임워크 | React Native + Expo (Expo Dev Client) |
| Firebase 연동 | React Native Firebase |
| 상태관리 | Zustand (웹과 로직 공유) |
| 애니메이션 | React Native Reanimated 3 |

### 공통 인프라

| 역할 | 기술 |
|---|---|
| 인증 | Firebase Authentication (이메일 + 소셜 로그인) |
| DB | Firestore (웹·앱 실시간 동기화) |
| Firebase 플랜 | Blaze (종량제) |
| 등급 관리 | Firebase Custom Claims (free / premium) |

---

## 폴더 구조

```
detoxday/
├── web/                          # React 웹 프로젝트
│   ├── public/
│   ├── src/
│   │   ├── assets/               # 이미지, 폰트 등 정적 파일
│   │   ├── components/           # 재사용 가능한 공통 컴포넌트
│   │   │   ├── common/           # 버튼, 모달, 인풋 등
│   │   │   ├── layout/           # Navbar, Footer 등
│   │   │   └── ui/               # 카드, 뱃지 등 UI 요소
│   │   ├── pages/                # 페이지 단위 컴포넌트
│   │   │   ├── Landing/          # 랜딩 페이지
│   │   │   ├── Auth/             # 로그인 / 회원가입
│   │   │   ├── Dashboard/        # 메인 대시보드
│   │   │   ├── Analysis/         # AI 분석 결과
│   │   │   ├── History/          # 분석 히스토리
│   │   │   ├── Goals/            # 목표 설정
│   │   │   ├── Garden/           # 반려 식물 (게이미피케이션)
│   │   │   ├── Badges/           # 뱃지 & 칭호
│   │   │   └── Pricing/          # 요금제
│   │   ├── store/                # Zustand 전역 상태
│   │   ├── hooks/                # 커스텀 훅
│   │   ├── services/             # Firebase, API 호출 로직
│   │   │   ├── firebase.ts       # Firebase 초기화
│   │   │   ├── auth.ts           # 인증 관련
│   │   │   ├── firestore.ts      # DB 관련
│   │   │   ├── storage.ts        # 이미지 업로드
│   │   │   └── functions.ts      # Cloud Functions 호출
│   │   ├── types/                # TypeScript 타입 정의
│   │   ├── utils/                # 공통 유틸 함수
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts              # 함수 진입점
│   │   ├── gemini.ts             # Gemini API 호출 로직
│   │   ├── paypal.ts             # PayPal 결제 처리
│   │   └── premium.ts            # Custom Claims 업데이트
│   ├── tsconfig.json
│   └── package.json
│
├── app/                          # React Native 앱 (웹 완성 후 개발)
│   └── (웹 완성 후 시작)
│
└── firebase.json                 # Firebase 프로젝트 설정
```

---

## 웹 페이지 구성

### 랜딩 페이지 (비로그인 상태)
- **Navigation** — 로고, 메뉴, 로그인/회원가입 버튼
- **Hero** — 서비스 핵심 메시지 및 CTA 버튼
- **Stats** — 숫자 카운터 애니메이션 포함 통계 (예: 누적 사용자 수, 평균 디톡스 시간 등)
- **Features** — 핵심 기능 소개 (AI 분석, 반려 식물, 뱃지 시스템, 목표 설정)
- **Pricing** — 무료 / 프리미엄 요금제 비교

### 인증
- **로그인** — 이메일 + 소셜 로그인 (Google 등)
- **회원가입** — 이메일 + 소셜 로그인

### 로그인 후 (앱 내부)
- **Dashboard** — 메인 화면. 오늘의 디톡스 현황, 반려 식물 상태, 최근 분석 결과 요약
- **스크린샷 업로드 & 분석** — 스크린타임 스크린샷 업로드 → AI 분석 결과 표시
  - 무료: 텍스트 분석 결과만
  - 프리미엄: 텍스트 + 그래프/차트 상세 분석
- **분석 히스토리** — 과거 분석 기록 조회
- **목표 설정** — 디톡스 목표 설정 및 진행 현황 추적
- **반려 식물 (Garden)** — 디톡스 시간에 따라 성장하는 가상 식물
- **뱃지 & 칭호** — 달성한 뱃지/칭호 확인 및 SNS 공유
- **요금제 / 결제** — PayPal 결제 페이지

---

## AI 분석 흐름

```
[사용자 스크린타임 스크린샷 업로드]
        ↓
[Firebase Storage에 이미지 저장]
        ↓
[Cloud Functions 트리거]
        ↓
[Gemini 2.5 Flash Vision API 호출 — 이미지 분석]
        ↓
[분석 결과 Firestore 저장]
        ↓
[무료] 텍스트 결과만 표시
[프리미엄] 텍스트 + 그래프/차트 표시
```

---

## 결제 흐름

```
[웹 요금제 페이지에서 PayPal 결제]
        ↓
[Cloud Functions → PayPal 결제 검증]
        ↓
[Firebase Custom Claims → premium: true 설정]
        ↓
[Firestore에 구독 상태 저장]
        ↓
[웹·앱 어디서든 프리미엄 기능 자동 활성화]
```

- 결제는 웹에서만 처리
- 앱에는 결제 버튼 없음 (앱스토어 정책상 디지털 상품은 인앱결제만 허용)

---

## Firestore 데이터 구조

```
users/
  {uid}/
    profile:   { name, email, createdAt, premium: bool }
    goals/
      {goalId}:    { title, targetMinutes, startDate, endDate, status }
    analyses/
      {analysisId}: { imageUrl, result, createdAt, isPremium }
    garden/
      plant:   { level, totalDetoxMinutes, lastUpdated }
    badges/
      {badgeId}:   { name, earnedAt, shared: bool }
```

---

## 보안 규칙

- Gemini API Key — Cloud Functions 환경변수로만 관리, 프론트엔드 노출 절대 금지
- PayPal Secret — Cloud Functions 환경변수로만 관리
- Firestore Rules — 본인 데이터만 읽기/쓰기 가능하도록 설정

---

## 개발 시 주의사항

1. **스타일링/애니메이션 미확정** — 개발 진행하면서 별도로 결정 후 추가 지시 예정
2. **Firebase Blaze 플랜 필수** — Cloud Functions에서 외부 API(Gemini, PayPal) 호출을 위해 필요
3. **iOS 스크린타임 직접 측정 불가** — Apple 정책상 서드파티 앱은 타 앱 사용시간 측정 불가. 스크린샷 업로드 방식으로 대체
4. **웹·앱 공통 로직 재사용** — Zustand store, 유틸 함수, TypeScript 타입 등은 최대한 공유 가능하게 설계
5. **Expo Dev Client 사용** — React Native Firebase는 네이티브 코드가 필요하므로 Expo Go 사용 불가. 앱 개발 시작 시 반드시 Expo Dev Client로 세팅
