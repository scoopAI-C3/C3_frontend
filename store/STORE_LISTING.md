# Chrome 웹 스토어 등록 자료

개발자 대시보드(https://chrome.google.com/webstore/devconsole)에 그대로 붙여 넣을 내용입니다.
`<...>` 로 표시된 곳만 채우면 됩니다.

## 0. 제출 전에 끝나 있어야 하는 것

백엔드 서버는 필요 없습니다. 분석은 확장 프로그램 안에서 실행되고, 리포트의 LLM 문장만 Vercel 함수(`api/insights.ts`)가 만듭니다.

- [ ] Vercel 프로젝트 Environment Variables 에 `OPENAI_API_KEY` 를 넣고 재배포했다
- [x] 재배포 후 `https://handofff.vercel.app/privacy.html` 이 열린다 (2026-11-18 확인)
- [ ] 재배포 후 확장 프로그램에서 결과 화면을 열면 리포트의 "AI가 정리한 인사이트"에 AI가 쓴 문장이 나온다 (함수가 실패하면 규칙 기반 문장이 대신 나오므로, 문장이 매번 같다면 함수 로그를 확인)
- [x] `public/privacy.html` 의 문의 메일을 넣었다 (haeun9634@naver.com)
- [x] `npm run zip` 으로 `handoff-extension.zip` 을 만들었다
- [x] ChatGPT · Claude · Gemini 실제 화면에서 감지 규칙 확인 (2026-11-17, `src/content.ts` 의 `SELECTORS`). Copilot은 copilot.com으로 이전하며 로그인이 필요해져 첫 출시에서 제외
- [x] 개발자 모드로 올린 확장 프로그램으로 세 사이트에서 질문 전송·응답 시작·응답 끝이 한 번씩 기록되는 것을 확인 (2026-11-17, 실제 크롬)
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

> AI와 어떻게 협업하는지 분석해 드립니다. 기본은 대화 내용 없이 시점만, 동의하면 질문 유형까지 분석합니다.

English (매니페스트 `description` 과 동일):

> See how you collaborate with AI on ChatGPT, Claude and Gemini. Timing-based; prompts are analyzed only if you opt in.

### 상세 설명 — 한국어

```
당신은 AI와 어떻게 협업하고 있나요?

HANDOFF는 ChatGPT, Claude, Gemini를 쓰는 방식을 분석해 나의 AI 협업 스타일을 알려 주는 확장 프로그램입니다.

■ 이렇게 동작합니다
1. 평소처럼 AI와 대화합니다.
2. HANDOFF가 프롬프트를 보낸 시점과 AI가 응답을 시작하고 끝낸 시점을 기록합니다.
3. 팝업에서 "내 결과 보기"를 누르면 분석 결과를 볼 수 있습니다.

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

■ 상세 분석 (선택)
동의한 사람만 켤 수 있습니다. 지금 이 대화만, 오늘만, 끌 때까지 중 범위를 고르면
그 안에서 보낸 질문을 실행·의견·검증·수정·정보 요청으로 분류해 결과가 더 정확해집니다.
질문 텍스트는 브라우저 안에서 분류한 뒤 바로 버리며, 저장하거나 보내지 않습니다.
켜져 있는 동안 AI 사이트 오른쪽 위에 표시가 보이고, 거기서 바로 끌 수 있습니다.

■ 개인정보
· 기본 분석은 프롬프트와 AI 응답의 내용을 사용하지 않습니다. 시점과 이벤트 종류만 기록합니다.
· 기록은 브라우저 안에만 저장됩니다. 사용자 기록을 보관하는 서버가 없습니다.
· 리포트 문장을 만들 때만 집계 숫자(횟수, 평균 간격, 점수)를 AI로 보내며, 저장하지 않습니다.
· 로그인이 없고 이름·이메일·계정 정보를 수집하지 않습니다.
· 지원하는 3개 사이트에서만 동작합니다.
· 팝업의 Monitoring 스위치로 언제든 끌 수 있습니다.

한국어와 영어를 지원합니다.
```

### 상세 설명 — English

```
How do you collaborate with AI?

HANDOFF analyzes the way you work with ChatGPT, Claude and Gemini and shows you your AI collaboration style.

■ How it works
1. Chat with AI as you normally do.
2. HANDOFF records when you send a prompt and when the AI starts and finishes responding.
3. Click "View my result" in the popup to see your results. The analysis runs in your browser.

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

■ Detailed analysis (optional)
Only people who consent can turn it on. Choose a scope (this conversation, today, or until you turn it off),
and prompts sent within it are classified as do / opinion / check / revise / info requests for a more precise result.
Prompt text is classified in your browser and discarded right away; it is never stored or sent.
While it's on, an indicator shows at the top right of the AI site, where you can turn it off.

■ Privacy
· By default, the content of your prompts and AI responses is not used. Only timing and event type are recorded.
· Your records stay in your browser. There is no server keeping user records.
· Only aggregated numbers (counts, average interval, scores) are sent to generate the report sentences, and they are not stored.
· No sign-in. No name, email or account information is collected.
· Runs only on the three supported sites.
· Turn it off at any time with the Monitoring switch in the popup.

Available in Korean and English.
```

## 2. 개인정보 보호 관행 탭

### 단일 목적 (Single purpose)

```
HANDOFF has a single purpose: to analyze the timing pattern of the user's interactions with AI chat services (ChatGPT, Claude, Gemini) and show the user their AI collaboration style.
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

**호스트 권한 (content script: chatgpt.com, claude.ai, gemini.google.com)**

```
The content script runs only on these three AI chat sites. By default it observes DOM changes to detect three moments: when the user submits a prompt, when the AI response starts, and when it ends, and records only the event type and timestamp. To avoid counting the same prompt twice, it compares the text of prompt bubbles in memory to tell them apart; this text is never stored or transmitted.

Optional "Detailed analysis": only after the user opens a consent screen in the popup, reads what is accessed, checks an explicit consent box and chooses a scope (this conversation only, today only, or until turned off), the content script reads the text of prompts the user sends within that scope and classifies each one into a request type (do / opinion / check / revise / info) inside the browser. The text is discarded immediately after classification and is never stored or transmitted; only the type label and character counts are kept locally. A visible indicator is shown on the page while it is active and lets the user turn it off. "Today only" turns off at midnight; the other scopes stay on until the user turns them off from the indicator or the popup.

The content script never modifies the page content (apart from the indicator) and all records stay in the browser.
```

**원격 코드 (Remote code)**: **아니요, 원격 코드를 사용하지 않습니다.** 모든 스크립트가 패키지에 포함되어 있습니다.

### 데이터 사용 (Data usage) 체크 항목

체크할 것:

- [x] **사용자 활동 (User activity)** — 프롬프트를 보낸 시점과 응답 시작·종료 시점을 기록하고, 사용자가 분석을 요청하면 그 **집계 수치**(횟수, 평균 간격, 등급, 점수, 상세 분석을 켠 경우 요청 유형별 개수)를 LLM 문장 생성을 위해 전송합니다.
- [x] **웹사이트 콘텐츠 (Website content)** — 기본 모드에서는 같은 질문을 두 번 세지 않도록 질문 말풍선의 텍스트를 메모리에서 비교만 하고, 상세 분석을 켠 경우에는 질문 텍스트를 읽어 분류합니다. 어느 경우에도 텍스트는 저장하지 않고 기기 밖으로 보내지 않으므로 엄밀히는 "수집"이 아닐 수 있지만, 읽는 것 자체를 숨기지 않기 위해 체크하는 쪽을 권합니다. 신고를 덜 하는 것보다 더 하는 쪽이 반려 위험이 낮습니다.

체크하지 않는 것: 개인 식별 정보, 건강 정보, 금융 및 결제 정보, 인증 정보, 개인 커뮤니케이션, 위치, 웹 기록

> 심사에서 질문이 오면: 기본 분석은 시각만 쓰고, 상세 분석은 동의 화면(읽는 것·하지 않는 것·범위·동의 체크)을 거친 뒤에만 켜지며, 텍스트는 브라우저 안에서 분류 직후 버린다고 답하면 됩니다. 밖으로 나가는 건 집계 수치뿐이며 Vercel 함수를 거쳐 OpenAI로 전달되고 저장되지 않습니다.

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
No account is required. The interface follows the browser language (English, or Korean for Korean browsers); Korean labels are given in parentheses.

1. Install the extension, open https://chatgpt.com (or claude.ai, gemini.google.com) and sign in with any account of your own.
2. Send two or three prompts.
3. Click the HANDOFF toolbar icon. The popup shows "Observing" and RECENT EVENTS (prompt submitted / AI response started / finished). Only the event type and time are recorded, never message text.
4. Click "View my result →" ("내 결과 보기 →") in the popup to see the analysis result. At the bottom of the result page, "View Analysis Report" ("분석 리포트 보기") opens the detailed report.
5. Before any prompts are recorded, the result page links to a 10-question survey you can try instead.

The Monitoring switch in the popup stops all collection.

To test the optional Detailed analysis: open the popup while a ChatGPT/Claude/Gemini chat is the active tab, click "Turn on" ("상세 분석 켜기"), read the consent screen, check the consent box, choose a scope and click "Agree and start" ("동의하고 시작"). An indicator appears at the top right of the chat page. Send a few prompts, then open the report: the "Request Types" ("요청 유형") section shows the classification. Prompt text is never stored (you can inspect chrome.storage to confirm), and detailed analysis can be turned off from the indicator or the popup.
```

## 5. 등록 후 할 일

0. (Vercel 프로젝트 주인) Vercel 대시보드 → Analytics 탭에서 **Web Analytics를 켠다**. (2026-11-18: 운영 사이트에서 통계 스크립트가 응답해 이미 켜져 있는 것으로 보임. 방문 수가 찍히는지만 확인) 코드는 이미 들어가 있어서 켜기만 하면 소개 페이지 방문 수, 조회 수, 유입 경로가 집계된다. 웹 스토어 대시보드의 설치 수·노출 수와 함께 보면 된다. 소개 페이지의 설치 버튼에는 `utm_source=handoff-web` 이 붙어 있어 스토어 통계에서 소개 페이지를 거쳐 온 방문을 구분할 수 있다.

1. Vercel 환경 변수 `ALLOWED_ORIGINS` 를 `chrome-extension://<확장 ID>,https://handofff.vercel.app` 로 넣어, 우리 확장 프로그램과 웹에서만 LLM 함수를 호출할 수 있게 좁힌다.
2. Vercel 환경 변수 `VITE_STORE_URL=https://chromewebstore.google.com/detail/<ID>` 를 넣고 웹을 재배포한다. 설치 안내가 GitHub 수동 설치에서 스토어 링크로 바뀐다.
3. 업데이트를 올릴 때는 `manifest.json` 과 `package.json` 의 `version` 을 함께 올린다.
