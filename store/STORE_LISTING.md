# Chrome 웹 스토어 등록 자료

개발자 대시보드(https://chrome.google.com/webstore/devconsole)에 그대로 붙여 넣을 내용입니다.
`<...>` 로 표시된 곳만 채우면 됩니다.

## 0. 제출 전에 끝나 있어야 하는 것

백엔드 서버는 필요 없습니다. 분석은 확장 프로그램 안에서 실행되고, 리포트의 LLM 문장만 Vercel 함수(`api/insights.ts`)가 만듭니다.

- [ ] Vercel 프로젝트 Environment Variables 에 `OPENAI_API_KEY` 를 넣고 재배포했다
- [ ] 재배포 후 `https://handofff.vercel.app/privacy.html` 이 열린다
- [ ] 재배포 후 확장 프로그램에서 분석을 실행하면 리포트의 "LLM 상세 분석"에 LLM이 쓴 문장이 나온다 (함수가 실패하면 규칙 기반 문장이 대신 나오므로, 문장이 매번 같다면 함수 로그를 확인)
- [ ] `public/privacy.html` 의 `CONTACT_EMAIL` 2곳을 실제 문의 메일로 바꿨다
- [ ] `npm run zip` 으로 `handoff-extension.zip` 을 만들었다
- [ ] ChatGPT · Claude · Gemini · Copilot 각각에서 프롬프트 1회 전송 시 팝업 RECENT EVENTS에 3줄(전송/응답 시작/응답 종료)이 찍히는지 직접 확인했다 (`src/content.ts` 의 `SELECTORS`)
- [ ] 개발자 계정 등록(1회 $5), 2단계 인증, 문의 이메일 인증

## 1. 스토어 등록정보

| 항목 | 값 |
|---|---|
| 이름 | HANDOFF - AI Collaboration Style Analyzer (매니페스트에서 자동 입력) |
| 카테고리 | 도구(Tools) |
| 언어 | 한국어, English |
| 아이콘 | `public/icons/icon-128.png` |
| 스크린샷 (1280×800) | `store/screenshots/01~05` (최대 5장) |
| 작은 프로모션 타일 (440×280) | `store/promo-tile-440x280.png` |
| 홈페이지 URL | https://handofff.vercel.app |
| 지원 URL | https://github.com/scoopAI-C3/C3_frontend/issues |

### 요약 설명 (132자 이내)

한국어:

> AI와 어떻게 협업하는지 분석해 드립니다. ChatGPT·Claude·Gemini·Copilot 대화의 내용이 아닌 시점만 사용합니다.

English (매니페스트 `description` 과 동일):

> See how you collaborate with AI. Uses only the timing of your chats on ChatGPT, Claude, Gemini and Copilot, never the content.

### 상세 설명 — 한국어

```
당신은 AI와 어떻게 협업하고 있나요?

HANDOFF는 ChatGPT, Claude, Gemini, Copilot을 쓰는 방식을 분석해 나의 AI 협업 스타일을 알려 주는 확장 프로그램입니다.

■ 이렇게 동작합니다
1. 평소처럼 AI와 대화합니다.
2. HANDOFF가 프롬프트를 보낸 시점과 AI가 응답을 시작하고 끝낸 시점을 기록합니다.
3. "협업 스타일 결과 보기"를 누르면 분석 결과를 볼 수 있습니다.

■ 볼 수 있는 것
· 4가지 협업 스타일 중 나의 유형
  - Balanced Collaborator (균형 잡힌 협업자)
  - AI-Assisted Thinker (AI 보조 사고자)
  - AI-Driven Executor (AI 주도 실행자)
  - AI Checker (AI 검증자)
· 강점과 주의할 점, 협업 팁
· 하루 타임라인, 사용 빈도, 평균 프롬프트 간격, 도구별 사용 비율
· 심층 분석 리포트
· 24시간 동안 유효한 결과 공유 링크 (결과가 링크 안에 담기며 서버에 저장되지 않음)
· 확장 프로그램 사용 기록 없이도 해 볼 수 있는 10문항 설문

■ 개인정보
· 프롬프트와 AI 응답의 내용은 수집하지 않습니다. 시점과 이벤트 종류만 사용합니다.
· 기록은 브라우저 안에만 저장됩니다. 사용자 기록을 보관하는 서버가 없습니다.
· 로그인이 없고 이름·이메일·계정 정보를 수집하지 않습니다.
· 지원하는 4개 사이트에서만 동작합니다.
· 팝업의 Monitoring 스위치로 언제든 끌 수 있습니다.

한국어와 영어를 지원합니다.
```

### 상세 설명 — English

```
How do you collaborate with AI?

HANDOFF analyzes the way you work with ChatGPT, Claude, Gemini and Copilot and shows you your AI collaboration style.

■ How it works
1. Chat with AI as you normally do.
2. HANDOFF records when you send a prompt and when the AI starts and finishes responding.
3. Click "View Collaboration Style" to see your results. The analysis runs in your browser.

■ What you get
· Your type among four collaboration styles
  - Balanced Collaborator
  - AI-Assisted Thinker
  - AI-Driven Executor
  - AI Checker
· Strengths, cautions and collaboration tips
· Daily timeline, usage frequency, average prompt interval and usage by tool
· An in-depth analysis report
· A share link for your results, valid for 24 hours (the result lives inside the link, not on a server)
· A 10-question survey you can take without any usage history

■ Privacy
· The content of your prompts and AI responses is never collected. Only timing and event type are used.
· Your records stay in your browser. There is no server keeping user records.
· No sign-in. No name, email or account information is collected.
· Runs only on the four supported sites.
· Turn it off at any time with the Monitoring switch in the popup.

Available in Korean and English.
```

## 2. 개인정보 보호 관행 탭

### 단일 목적 (Single purpose)

```
HANDOFF has a single purpose: to analyze the timing pattern of the user's interactions with AI chat services (ChatGPT, Claude, Gemini, Microsoft Copilot) and show the user their AI collaboration style.
```

### 권한 사용 이유

**storage**

```
All user data is stored locally with this permission; there is no backend database. It stores the monitoring on/off setting, the 50 most recent interaction events shown in the popup, and the interaction timeline and analysis results of up to 20 recent sessions. The service worker also keeps in-progress session state in storage.session so it survives service worker restarts.
```

**alarms**

```
Used for a single one-minute idle timer. When the user has stopped prompting for one minute, the service worker saves a summary of the accumulated interactions to local storage. An alarm is required because setTimeout does not survive Manifest V3 service worker termination.
```

**호스트 권한 (content script: chatgpt.com, claude.ai, gemini.google.com, copilot.microsoft.com)**

```
The content script runs only on these four AI chat sites. It observes DOM changes to detect three moments: when the user submits a prompt, when the AI response starts, and when it ends. It records only the event type and timestamp. It does not read, store or transmit the text of prompts or responses, and it does not modify the page. The recorded events stay in the browser.
```

**원격 코드 (Remote code)**: **아니요, 원격 코드를 사용하지 않습니다.** 모든 스크립트가 패키지에 포함되어 있습니다.

### 데이터 사용 (Data usage) 체크 항목

체크할 것:

- [x] **사용자 활동 (User activity)** — 프롬프트를 보낸 시점과 응답 시작·종료 시점을 기록하고, 사용자가 분석을 요청하면 그 **집계 수치**(횟수, 평균 간격, 등급, 점수)를 LLM 문장 생성을 위해 전송합니다.

체크하지 않는 것: 개인 식별 정보, 건강 정보, 금융 및 결제 정보, 인증 정보, 개인 커뮤니케이션, 위치, 웹 기록, 웹사이트 콘텐츠

> 심사에서 질문이 오면: 개별 이벤트와 사이트 정보는 브라우저 밖으로 나가지 않고, 식별자도 만들지 않으며, 집계 수치만 Vercel 함수를 거쳐 OpenAI로 전달되고 저장되지 않는다고 답하면 됩니다.

인증 3항목은 모두 체크:

- [x] 승인된 사용 사례 외에 제3자에게 사용자 데이터를 판매하거나 전송하지 않습니다
- [x] 항목의 단일 목적과 관련 없는 용도로 사용자 데이터를 사용하거나 전송하지 않습니다
- [x] 신용도 판단이나 대출 목적으로 사용자 데이터를 사용하거나 전송하지 않습니다

### 개인정보처리방침 URL

```
https://handofff.vercel.app/privacy.html
```

## 3. 배포 탭

| 항목 | 값 |
|---|---|
| 결제 | 무료 |
| 공개 범위 | 공개 (처음에는 "비공개(Unlisted)"로 올려 실제 설치 테스트 후 공개 전환 권장) |
| 지역 | 모든 지역 |

## 4. 심사자용 테스트 안내 (Test instructions)

```
No account is required.

1. Install the extension and open https://chatgpt.com (or claude.ai, gemini.google.com, copilot.microsoft.com) and sign in with any account of your own.
2. Send two or three prompts.
3. Click the HANDOFF toolbar icon. The popup shows "Observing" and the recent events (prompt submitted / AI response started / finished). Only event type and time are recorded, never message text.
4. Click "Open Full Dashboard", then "View Collaboration Style" to see the analysis result.
5. Alternatively, click "Survey" on the landing page to try the 10-question survey without any usage data.

The Monitoring switch in the popup stops all collection.
```

## 5. 등록 후 할 일

1. Vercel 환경 변수 `ALLOWED_ORIGINS` 를 `chrome-extension://<확장 ID>,https://handofff.vercel.app` 로 넣어, 우리 확장 프로그램과 웹에서만 LLM 함수를 호출할 수 있게 좁힌다.
2. Vercel 환경 변수 `VITE_STORE_URL=https://chromewebstore.google.com/detail/<ID>` 를 넣고 웹을 재배포한다. 설치 안내가 GitHub 수동 설치에서 스토어 링크로 바뀐다.
3. 업데이트를 올릴 때는 `manifest.json` 과 `package.json` 의 `version` 을 함께 올린다.
