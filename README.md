# HANDOFF - AI Collaboration Profile Analyzer

<p align="center">
  <img src="public/icons/icon-128.png" alt="HANDOFF Logo" width="128" height="128">
</p>

<p align="center">
  <strong>당신은 AI와 어떻게 협업하고 있나요?</strong><br>
  AI 협업 스타일을 분석하고 인간과 AI 사이의 '결정 경계'를 찾아주는 Chrome 확장 프로그램
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.18-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Chrome_Extension-MV3-4285F4?style=flat-square&logo=googlechrome" alt="Chrome Extension">
</p>

---

## 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [지원 플랫폼](#지원-플랫폼)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 방법](#설치-방법)
- [사용 방법](#사용-방법)
- [개발 환경 설정](#개발-환경-설정)
- [API 명세](#api-명세)
- [AI 협업 스타일 유형](#ai-협업-스타일-유형)
- [라이선스](#라이선스)

---

## 소개

**HANDOFF**는 사용자가 AI 도구(ChatGPT, Claude, Gemini, Copilot)와 상호작용하는 패턴을 실시간으로 모니터링하고 분석하여, 개인화된 AI 협업 스타일 프로필을 제공하는 Chrome 확장 프로그램입니다.

### 핵심 가치

- **자기 인식**: 자신의 AI 사용 패턴을 객관적으로 파악
- **협업 최적화**: AI와의 효과적인 협업 방식 발견
- **결정 경계 분석**: 인간과 AI 사이의 의사결정 경계를 시각화

---

## 주요 기능

### 1. 실시간 행동 모니터링
- AI 플랫폼에서의 사용자 상호작용 자동 추적
- 프롬프트 제출, AI 응답 시작/종료 이벤트 감지
- 세션 기반 활동 로깅

### 2. AI 협업 스타일 분석
- 4가지 협업 스타일 유형 분류
  - Balanced Collaborator (균형 잡힌 협업자)
  - AI-Assisted Thinker (AI 보조 사고자)
  - AI-Driven Executor (AI 주도 실행자)
  - AI Checker (AI 검증자)
- 강점 및 주의사항 분석
- 맞춤형 협업 팁 제공

### 3. 대시보드
- Daily Timeline: 일일 AI 협업 타임라인 시각화
- Data Summary: 사용 빈도, 평균 프롬프트 간격, 개선 비율 등
- Relative Styles: 다른 스타일 대비 상대적 성향 분석
- AI Tool Usage: 플랫폼별 사용 비율 차트

### 4. 분석 리포트
- LLM 기반 심층 인사이트 제공
- 패턴 분석 결과
- 그래프 기반 메트릭스 시각화

### 5. 공유 기능
- 결과 공유 링크 생성 (24시간 유효)
- 클립보드 자동 복사

### 6. 다국어 지원
- 한국어 / 영어 지원
- 실시간 언어 전환

### 7. 설문조사 모드
- AI 사용 없이도 협업 스타일 진단 가능
- 8개 질문 기반 간편 테스트

---

## 지원 플랫폼

| 플랫폼 | URL | 상태 |
|--------|-----|------|
| ChatGPT | `https://chatgpt.com/*` | 지원 |
| Claude | `https://claude.ai/*` | 지원 |
| Gemini | `https://gemini.google.com/*` | 지원 |
| Microsoft Copilot | `https://copilot.microsoft.com/*` | 지원 |

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 프레임워크 |
| TypeScript | 5.9.3 | 정적 타입 지원 |
| Vite | 7.2.4 | 빌드 도구 |
| TailwindCSS | 4.1.18 | 스타일링 |
| React Router DOM | 7.11.0 | 라우팅 |
| Axios | 1.13.2 | HTTP 클라이언트 |
| Lucide React | 0.562.0 | 아이콘 |

### Chrome Extension
| 기술 | 용도 |
|------|------|
| Manifest V3 | Chrome 확장 프로그램 표준 |
| @crxjs/vite-plugin | Vite 기반 확장 프로그램 빌드 |
| Chrome Storage API | 로컬 데이터 저장 |
| Content Scripts | 웹페이지 상호작용 모니터링 |
| Service Worker | 백그라운드 이벤트 처리 |

---

## 프로젝트 구조

```
C3_frontend/
├── dist/                          # 빌드 출력 디렉토리
├── public/
│   └── icons/                     # 확장 프로그램 아이콘
├── src/
│   ├── apis/                      # API 통신 모듈
│   │   ├── session.ts             # 세션 관련 API
│   │   └── share.ts               # 공유 기능 API
│   ├── assets/                    # 이미지 및 정적 리소스
│   ├── components/                # React 컴포넌트
│   │   ├── dashboard/             # 대시보드 섹션 컴포넌트
│   │   │   ├── DataStatusSection.tsx
│   │   │   ├── DetailResultSection.tsx
│   │   │   ├── SessionResultDisplay.tsx
│   │   │   ├── StrengthWeaknessSection.tsx
│   │   │   ├── StyleResultSection.tsx
│   │   │   └── TimelineSection.tsx
│   │   ├── AgentControlCard.tsx   # 메인 팝업 카드
│   │   ├── InstallModal.tsx       # 설치 안내 모달
│   │   ├── LanguageToggle.tsx     # 언어 전환 토글
│   │   ├── LoadingSpinner.tsx     # 로딩 스피너
│   │   ├── PrimaryStyleTypeCard.tsx
│   │   └── ScrollReveal.tsx       # 스크롤 애니메이션
│   ├── contexts/
│   │   └── LanguageContext.tsx    # 다국어 Context
│   ├── hooks/
│   │   └── useScrollAnimation.ts  # 스크롤 애니메이션 훅
│   ├── pages/                     # 페이지 컴포넌트
│   │   ├── Dashboard.tsx          # 대시보드 페이지
│   │   ├── LandingPage.tsx        # 랜딩 페이지
│   │   ├── ReportPage.tsx         # 분석 리포트 페이지
│   │   ├── SharedPage.tsx         # 공유 결과 페이지
│   │   ├── SurveyIntroPage.tsx    # 설문 소개 페이지
│   │   └── SurveyPage.tsx         # 설문조사 페이지
│   ├── types/                     # TypeScript 타입 정의
│   │   ├── agent.ts               # 에이전트 이벤트 타입
│   │   ├── session.ts             # 세션 관련 타입
│   │   └── share.ts               # 공유 기능 타입
│   ├── App.tsx                    # 메인 앱 컴포넌트
│   ├── background.ts              # Service Worker (백그라운드)
│   ├── content.ts                 # Content Script
│   ├── index.css                  # 전역 스타일
│   └── main.tsx                   # React 엔트리포인트
├── .env                           # 환경 변수
├── index.html                     # HTML 템플릿
├── manifest.json                  # Chrome 확장 프로그램 매니페스트
├── package.json                   # 프로젝트 의존성
├── tsconfig.json                  # TypeScript 설정
└── vite.config.ts                 # Vite 설정
```

---

## 설치 방법

### 사전 요구사항
- Node.js 18.x 이상
- npm 또는 pnpm
- Chrome 브라우저

### 1. 저장소 클론

```bash
git clone https://github.com/scoopAI-C3/C3_frontend.git
cd C3_frontend
```

### 2. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 API URL을 설정합니다:

```env
VITE_API_URL=https://your-api-server.com
```

### 4. 빌드

```bash
npm run build
```

### 5. Chrome에 확장 프로그램 설치

1. Chrome 브라우저에서 `chrome://extensions` 접속
2. 우측 상단 **"개발자 모드"** 활성화
3. **"압축해제된 확장 프로그램을 로드합니다"** 클릭
4. 프로젝트의 `dist` 폴더 선택

---

## 사용 방법

### 기본 사용법

1. **확장 프로그램 설치** 후 지원되는 AI 플랫폼(ChatGPT, Claude, Gemini, Copilot) 방문
2. **AI와 대화**하며 평소처럼 작업 수행
3. 확장 프로그램 아이콘 클릭하여 **실시간 모니터링 상태** 확인
4. **"협업 스타일 결과 보기"** 버튼 클릭하여 분석 결과 확인

### 페이지별 기능

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 팝업 | `/` | 에이전트 상태 및 모니터링 제어 |
| 랜딩 | `/landing` | 서비스 소개 및 진입점 |
| 대시보드 | `/dashboard` | 분석 결과 종합 |
| 리포트 | `/report` | 상세 분석 리포트 |
| 설문 소개 | `/survey-intro` | 설문조사 안내 |
| 설문 | `/survey` | 설문 문항 |
| 공유 | `/share/:token` | 공유된 결과 보기 |

### 모니터링 제어

- **Toggle ON/OFF**: 확장 프로그램 팝업에서 모니터링 활성화/비활성화
- **Clear Events**: 저장된 이벤트 초기화

---

## 개발 환경 설정

### 개발 서버 실행

```bash
npm run dev
```

### 린트 실행

```bash
npm run lint
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 미리보기

```bash
npm run preview
```

---

## API 명세

### Base URL
```
${VITE_API_URL}/api
```

### 세션 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/session/start` | POST | 새 세션 시작 |
| `/session/observe` | POST | 세션 행동 기록 |
| `/session/analyze` | POST | 세션 분석 요청 |
| `/session/result/:sessionId` | GET | 분석 결과 조회 |
| `/session/recent` | GET | 최근 세션 목록 |
| `/session/graph/:sessionId` | GET | 그래프 데이터 조회 |

### AI 협업 타입 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/ai-collaboration-types` | GET | 모든 타입 목록 |
| `/ai-collaboration-types/:typeCode` | GET | 특정 타입 정보 |
| `/ai-collaboration-types/:typeCode/detail` | GET | 타입 상세 정보 |
| `/ai-collaboration-types/:typeCode/survey-result` | GET | 설문 결과 |
| `/ai-collaboration-types/all/details` | GET | 모든 타입 상세 |

### 공유 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/share/create` | POST | 공유 링크 생성 |
| `/share/:shareToken` | GET | 공유 결과 조회 |

### 다국어 지원

대부분의 GET API는 `language` 쿼리 파라미터를 지원합니다:

```
GET /api/session/result/:sessionId?language=en
GET /api/ai-collaboration-types/:typeCode/survey-result?language=en
```

---

## AI 협업 스타일 유형

### 1. Balanced Collaborator (균형 잡힌 협업자)
- **특징**: AI와 인간의 역할을 균형있게 조화
- **강점**: 상황에 맞는 유연한 협업 가능
- **컬러**: `#22C55E` (초록색)

### 2. AI-Assisted Thinker (AI 보조 사고자)
- **특징**: AI를 브레인스토밍 파트너로 활용
- **강점**: 아이디어 검증 및 확장에 탁월
- **컬러**: `#3B82F6` (파란색)

### 3. AI-Driven Executor (AI 주도 실행자)
- **특징**: AI에게 많은 작업을 위임
- **강점**: 효율적인 작업 처리
- **컬러**: `#F59E0B` (주황색)

### 4. AI Checker (AI 검증자)
- **특징**: AI 결과를 꼼꼼히 검토하고 수정
- **강점**: 품질 관리에 집중
- **컬러**: `#8B5CF6` (보라색)

---

## 이벤트 타입

Content Script에서 감지하는 이벤트:

| 이벤트 타입 | 설명 |
|------------|------|
| `SESSION_START` | AI 플랫폼 페이지 진입 |
| `SESSION_END` | AI 플랫폼 페이지 이탈 |
| `PROMPT_SUBMIT` | 사용자 프롬프트 전송 |
| `AI_RESPONSE_START` | AI 응답 시작 |
| `AI_RESPONSE_END` | AI 응답 완료 |

---

## 브라우저 지원

- Google Chrome (권장)
- Chromium 기반 브라우저 (Edge, Brave, Opera 등)

---

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.

---

## 기여자

- scoopAI-C3 Team

---

## 문의

프로젝트 관련 문의사항은 [GitHub Issues](https://github.com/scoopAI-C3/C3_frontend/issues)를 통해 제출해 주세요.
