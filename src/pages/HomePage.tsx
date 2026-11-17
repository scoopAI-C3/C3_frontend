import { Link } from "react-router-dom";
import TextLogo from "../assets/TextLogo.png";
import AppLogo from "../assets/appLogo.png";
import AI_Executor from "../assets/AI-DrivenExecutor.svg";
import AI_Thinker from "../assets/AI-AssistedThinker.svg";
import AI_Checker from "../assets/AI-Checker.svg";
import Balanced from "../assets/BalancedCollaborator.svg";
import resultShot from "../assets/home/result.webp";
import dataShot from "../assets/home/data.webp";
import usageShot from "../assets/home/usage.webp";
import reportShot from "../assets/home/report.webp";
import popupShot from "../assets/home/popup.webp";
import surveyShot from "../assets/home/survey.webp";
import LanguageToggle from "../components/LanguageToggle";
import HowWeMeasure from "../components/home/HowWeMeasure";
import { useLanguage } from "../contexts/LanguageContext";
import { INSTALL_URL, IS_STORE_LISTED, PRIVACY_URL } from "../constants/links";
import { TYPE_CONTENTS } from "../local/typeContents";
import type { TypeCode } from "../local/texts";

const GITHUB_URL = "https://github.com/scoopAI-C3/C3_frontend";
const DEMO_URL = "https://www.youtube.com/watch?v=AWG6oKiDhTY";

const STYLES: { code: TypeCode; name: string; icon: string; accent: string }[] = [
  { code: "AI_DRIVEN_EXECUTOR", name: "AI-Driven Executor", icon: AI_Executor, accent: "#F59E0B" },
  { code: "AI_ASSISTED_THINKER", name: "AI-Assisted Thinker", icon: AI_Thinker, accent: "#3B82F6" },
  { code: "AI_CHECKER", name: "AI Checker", icon: AI_Checker, accent: "#8B5CF6" },
  { code: "BALANCED_COLLABORATOR", name: "Balanced Collaborator", icon: Balanced, accent: "#22C55E" },
];

const COPY = {
  ko: {
    nav: { measure: "측정 방식", how: "작동 방식", styles: "협업 스타일", privacy: "개인정보" },
    install: IS_STORE_LISTED ? "Chrome에 추가" : "확장 프로그램 받기",
    tryWithout: "설치 없이 설문으로 해보기",
    eyebrow: "From Decision Boundary to Collaboration Style",
    heroTitle: ["당신은 AI와", "어떻게 협업하고 있나요?"],
    heroBody:
      "HANDOFF는 프롬프트를 읽지 않습니다. AI를 쓰는 '행동'만으로 판단이 AI에게 넘어가는 순간을 찾아, 나의 AI 협업 스타일로 보여 줍니다.",
    supported: "지원",
    award: "Scoop AI Hackathon in Seoul 우수상",
    problemEyebrow: "Problem",
    problemQuote: "AI를 많이 쓰지만, 나는 AI를 '어떻게' 쓰고 있는지 모른다.",
    problems: [
      { title: "보이지 않는 의존", body: "'AI가 편하다'는 감각 뒤에서, 스스로 따져 보는 과정이 조용히 줄어듭니다." },
      { title: "측정할 수 없는 효율", body: "빨리 끝냈다고 해서 잘 결정한 걸까요? 내가 고른 것과 AI가 고른 것을 구분할 수 없습니다." },
      { title: "결과만 남는 기록", body: "사용 시간·질문 횟수·결과물만 남고, 그 과정에 내 의도가 얼마나 담겼는지는 남지 않습니다." },
    ],
    perspectiveEyebrow: "Our Perspective",
    perspectiveTitle: ["AI 사용은 점이 아니라 흐름입니다.", "그 흐름 안에 '확신의 순간'이 있습니다."],
    boundaryTitle: "Decision Boundary",
    boundaryBody:
      "질문이 더 이상 이어지지 않고, AI의 답변이 그대로 행동으로 이어지는 순간. 이 지점에서 판단은 사용자에게서 AI로 넘어갑니다.",
    signalsTitle: "어떻게 포착하나요",
    signals: ["답변 후 다음 질문까지의 생각 시간", "답변 직후 다시 묻기 (수정·재질문)", "한 번에 이어 묻는 횟수", "대화를 마치는 시점"],
    measureLink: "그럼 무엇으로 판단하나요?",
    howEyebrow: "How it works",
    howTitle: "설치하고, 평소처럼 쓰면 됩니다",
    steps: [
      {
        title: "평소처럼 AI 사용",
        body: "ChatGPT, Claude, Gemini, Copilot에서 하던 대로 대화하세요. 따로 누를 것도, '분석 중'이라는 느낌도 없습니다.",
      },
      {
        title: "행동만 기록",
        body: "질문을 보낸 시각과 AI가 응답을 시작하고 끝낸 시각만 기록합니다. 기록은 내 브라우저 안에만 남습니다.",
      },
      {
        title: "협업 스타일 확인",
        body: "결과 보기를 누르면 스타일 카드, 하루 타임라인, 도구별 사용 비율, 분석 리포트를 볼 수 있습니다.",
      },
    ],
    stylesEyebrow: "AI Collaboration Styles",
    stylesTitle: "4가지 협업 스타일",
    stylesBody: "점수는 행동 데이터로 계산하고, 스타일도 규칙으로 정합니다. AI는 결과를 설명하는 문장에만 쓰입니다.",
    resultEyebrow: "Report",
    resultTitle: "결과는 숫자가 아니라 흐름으로",
    resultItems: [
      { title: "스타일 카드", body: "오늘의 협업 스타일과 강점, 주의할 점, 한 줄 팁" },
      { title: "데이터 요약", body: "AI 사용 빈도, 질문 간 평균 간격, 수정·재질문 비율, 결정 구간 빈도" },
      { title: "도구별 사용 비율", body: "ChatGPT·Claude·Gemini·Copilot 중 어디서 얼마나 썼는지" },
      { title: "분석 리포트", body: "패턴 분석과 단계별 분석 흐름, AI가 정리한 인사이트" },
    ],
    notEyebrow: "HANDOFF is NOT an AI evaluation tool",
    notTitle: "평가가 아니라 관찰입니다",
    doesNot: "하지 않는 것",
    doesNotItems: ["AI 결과 품질 평가", "AI 사용량 점수 매기기", "프롬프트·응답 수집", "옳고 그름 판단"],
    does: "하는 것",
    doesItems: ["AI 사이트에서의 행동 시점 기록", "행동 패턴으로 협업 스타일 분류", "스타일 카드와 타임라인으로 시각화"],
    privacyEyebrow: "Privacy-first",
    privacyTitle: "프롬프트는 보지 않습니다",
    privacyItems: [
      { title: "내용 수집 없음", body: "프롬프트와 AI 응답의 텍스트는 읽지도, 저장하지도 않습니다." },
      { title: "브라우저 안에만 저장", body: "기록과 분석 결과는 내 브라우저에만 있습니다. 사용자 기록을 보관하는 서버가 없습니다." },
      { title: "로그인 없음", body: "계정도 이메일도 필요 없습니다. 확장 프로그램을 지우면 기록도 함께 사라집니다." },
      { title: "언제든 끄기", body: "팝업의 Monitoring 스위치 하나로 기록을 멈출 수 있습니다." },
    ],
    privacyLink: "개인정보처리방침 보기",
    surveyEyebrow: "No install needed",
    surveyTitle: "설치 전에 설문으로 먼저",
    surveyBody: "10개의 질문으로 AI를 사고 보조로 쓰는지, 실행 파트너로 쓰는지 알아보세요. 결과는 링크로 공유할 수 있습니다.",
    surveyCta: "설문 시작하기",
    closing: ["우리는 AI를 '얼마나 쓰는가'가 아니라", "'어디까지 맡기고 있는가'를 봅니다."],
    footerTeam: "C3 팀 · 박하은, 이나현, 이예영",
    demo: "데모 영상",
  },
  en: {
    nav: { measure: "What we measure", how: "How it works", styles: "Styles", privacy: "Privacy" },
    install: IS_STORE_LISTED ? "Add to Chrome" : "Get the extension",
    tryWithout: "Try the survey, no install",
    eyebrow: "From Decision Boundary to Collaboration Style",
    heroTitle: ["How do you", "collaborate with AI?"],
    heroBody:
      "HANDOFF never reads your prompts. It looks only at how you use AI to find the moment a decision is handed off to AI, and shows it as your AI collaboration style.",
    supported: "Works on",
    award: "Excellence Award, Scoop AI Hackathon in Seoul",
    problemEyebrow: "Problem",
    problemQuote: "We use AI a lot, but we don't know how we use it.",
    problems: [
      { title: "Invisible dependence", body: "Behind the feeling that AI is convenient, the habit of thinking things through quietly fades." },
      { title: "Unmeasurable efficiency", body: "Finishing fast isn't the same as deciding well. You can't tell what you chose from what AI chose." },
      { title: "Only outcomes are recorded", body: "Usage time, prompt counts and outputs remain. How much of your intent shaped them does not." },
    ],
    perspectiveEyebrow: "Our Perspective",
    perspectiveTitle: ["Using AI is a flow, not a point.", "Inside that flow is a moment of certainty."],
    boundaryTitle: "Decision Boundary",
    boundaryBody:
      "The moment questions stop and the AI's answer turns straight into action. At that point, the decision moves from you to AI.",
    signalsTitle: "How we detect it",
    signals: ["Think time between an answer and your next prompt", "Re-asking right after an answer", "How many prompts you send in a row", "When a conversation ends"],
    measureLink: "So what does it look at?",
    howEyebrow: "How it works",
    howTitle: "Install it and use AI as usual",
    steps: [
      {
        title: "Use AI as usual",
        body: "Chat on ChatGPT, Claude, Gemini or Copilot as you always do. Nothing to click, nothing that feels like being analyzed.",
      },
      {
        title: "Only behavior is recorded",
        body: "Only when you send a prompt and when the AI starts and finishes responding. The records stay in your browser.",
      },
      {
        title: "See your style",
        body: "Open your result to see a style card, a daily timeline, usage by tool and an analysis report.",
      },
    ],
    stylesEyebrow: "AI Collaboration Styles",
    stylesTitle: "Four collaboration styles",
    stylesBody: "Scores come from behavior data and the style is decided by rules. AI is used only to write sentences explaining the result.",
    resultEyebrow: "Report",
    resultTitle: "A result you read as a flow, not a score",
    resultItems: [
      { title: "Style card", body: "Today's collaboration style, strengths, cautions and a one-line tip" },
      { title: "Data summary", body: "Usage frequency, average prompt interval, refinement rate and decision frequency" },
      { title: "Usage by tool", body: "How much you used ChatGPT, Claude, Gemini and Copilot" },
      { title: "Analysis report", body: "Pattern analysis, the step-by-step analysis flow and AI-written insights" },
    ],
    notEyebrow: "HANDOFF is NOT an AI evaluation tool",
    notTitle: "Observation, not evaluation",
    doesNot: "What it doesn't do",
    doesNotItems: ["Grade the quality of AI output", "Score how much you use AI", "Collect prompts or responses", "Judge right or wrong"],
    does: "What it does",
    doesItems: ["Record when things happen on AI sites", "Classify your style from behavior patterns", "Visualize it as a style card and timeline"],
    privacyEyebrow: "Privacy-first",
    privacyTitle: "We don't look at your prompts",
    privacyItems: [
      { title: "No content collected", body: "The text of your prompts and AI responses is never read or stored." },
      { title: "Stays in your browser", body: "Records and results live only in your browser. There is no server keeping user records." },
      { title: "No sign-in", body: "No account, no email. Remove the extension and the records go with it." },
      { title: "Turn it off anytime", body: "One Monitoring switch in the popup stops recording." },
    ],
    privacyLink: "Read the privacy policy",
    surveyEyebrow: "No install needed",
    surveyTitle: "Start with the survey",
    surveyBody: "Ten questions tell whether you use AI as a thinking aid or an execution partner. You can share the result with a link.",
    surveyCta: "Start the survey",
    closing: ["We don't look at how much you use AI,", "but at how much you hand over to it."],
    footerTeam: "Team C3 · 박하은, 이나현, 이예영",
    demo: "Demo video",
  },
};

const SITES = ["ChatGPT", "Claude", "Gemini", "Copilot"];

/**
 * 같은 페이지 안 섹션으로 이동.
 * 이 앱은 주소의 # 뒤를 화면 경로로 쓰는(HashRouter) 구조라, 일반 #앵커 링크를 쓰면
 * 없는 경로로 이동해 빈 화면이 된다. 그래서 주소를 바꾸지 않고 스크롤만 한다.
 */
const scrollToSection = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const gradientText = "bg-gradient-to-r from-[#FF7DFD] to-[#A36EFF] bg-clip-text text-transparent";

function Eyebrow({ children }: { children: string }) {
  return <p className="font-[Inter] text-sm font-semibold tracking-wide text-[#C59BFF] mb-3">{children}</p>;
}

function Shot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full rounded-2xl border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] ${className}`}
    />
  );
}

function InstallButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a
      href={INSTALL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F07CF8] to-[#A855F7] px-6 py-3.5 font-bold text-white transition-opacity hover:opacity-90 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
      {label}
    </a>
  );
}

const HomePage = () => {
  const { language } = useLanguage();
  const c = COPY[language];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden break-keep bg-[#211F26] text-white">
      {/* 배경 빛 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[#7C3BEC]/30 blur-[140px]" />
        <div className="absolute top-40 -right-40 h-[420px] w-[520px] rounded-full bg-[#E822E5]/15 blur-[120px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <img src={TextLogo} alt="HANDOFF" className="h-6 w-auto sm:h-7" />
        <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
          <a href="#measure" onClick={scrollToSection("measure")} className="hover:text-white">{c.nav.measure}</a>
          <a href="#how" onClick={scrollToSection("how")} className="hover:text-white">{c.nav.how}</a>
          <a href="#styles" onClick={scrollToSection("styles")} className="hover:text-white">{c.nav.styles}</a>
          <a href="#privacy" onClick={scrollToSection("privacy")} className="hover:text-white">{c.nav.privacy}</a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <span className="hidden sm:block">
            <InstallButton label={c.install} className="!px-4 !py-2 text-sm" />
          </span>
        </div>
      </header>

      <main className="relative z-10">
        {/* 히어로 */}
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-16 lg:pb-32">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/80">
              <span aria-hidden="true">🏆</span>
              {c.award}
            </span>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h1 className="text-[34px] font-extrabold leading-tight sm:text-5xl lg:text-[50px] lg:leading-[1.2]">
              {c.heroTitle[0]}
              <br />
              <span className={`${gradientText} sm:whitespace-nowrap`}>{c.heroTitle[1]}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{c.heroBody}</p>
            <a href="#measure" onClick={scrollToSection("measure")} className="mt-3 inline-block text-sm font-semibold text-[#C59BFF] hover:underline">
              {c.measureLink} →
            </a>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <InstallButton label={c.install} />
              <Link
                to="/survey-intro"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
              >
                {c.tryWithout} →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-white/50">
              <span>{c.supported}</span>
              {SITES.map((site) => (
                <span key={site} className="rounded-full bg-white/8 px-3 py-1 text-white/75 ring-1 ring-white/10">
                  {site}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <Shot src={resultShot} alt="HANDOFF result" />
            <img
              src={popupShot}
              alt="HANDOFF popup"
              className="absolute -bottom-12 -left-3 w-[34%] rounded-2xl border border-[#A36EFF]/50 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.8)] sm:-left-8"
            />
          </div>
        </section>

        {/* 문제 */}
        <section className="border-y border-white/5 bg-black/20">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <Eyebrow>{c.problemEyebrow}</Eyebrow>
            <blockquote className="max-w-3xl border-l-4 border-[#A36EFF] pl-5 text-2xl font-bold leading-snug sm:text-3xl">
              “{c.problemQuote}”
            </blockquote>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {c.problems.map((p, i) => (
                <div key={p.title} className="rounded-2xl border border-white/10 bg-[#2B2930] p-6">
                  <span className="font-[Inter] text-sm font-bold text-[#C59BFF]">0{i + 1}</span>
                  <h3 className="mt-2 text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 관점: Decision Boundary */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="text-center">
            <Eyebrow>{c.perspectiveEyebrow}</Eyebrow>
            <h2 className="text-2xl font-extrabold leading-snug sm:text-4xl">
              {c.perspectiveTitle[0]}
              <br />
              <span className={gradientText}>{c.perspectiveTitle[1]}</span>
            </h2>
          </div>

          {/* 흐름 그림: 질문이 이어지다 멈추고 행동으로 넘어가는 지점 */}
          <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/10 bg-[#2B2930] p-6 sm:p-10">
            <svg viewBox="0 0 800 150" className="h-auto w-full" role="img" aria-label="Decision Boundary">
              <defs>
                <linearGradient id="flow" x1="0" x2="1">
                  <stop offset="0" stopColor="#A36EFF" stopOpacity="0.5" />
                  <stop offset="0.62" stopColor="#FF7DFD" />
                  <stop offset="1" stopColor="#FF7DFD" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <line x1="20" y1="80" x2="780" y2="80" stroke="url(#flow)" strokeWidth="3" />
              {[60, 120, 165, 235, 300, 335, 390, 450].map((x) => (
                <circle key={x} cx={x} cy="80" r="7" fill="#A36EFF" />
              ))}
              <line x1="500" y1="22" x2="500" y2="138" stroke="#FF7DFD" strokeWidth="2" strokeDasharray="5 5" />
              <rect x="560" y="64" width="190" height="32" rx="16" fill="#FF7DFD" fillOpacity="0.15" stroke="#FF7DFD" />
              <text x="655" y="85" textAnchor="middle" fill="#FFD3FE" fontSize="15" fontWeight="700">
                {language === "ko" ? "행동으로 이어짐" : "Turns into action"}
              </text>
              <text x="240" y="40" textAnchor="middle" fill="#ffffff" fillOpacity="0.6" fontSize="14">
                {language === "ko" ? "질문 · 수정 · 재질문" : "Ask · refine · re-ask"}
              </text>
              <text x="500" y="14" textAnchor="middle" fill="#FF7DFD" fontSize="14" fontWeight="700">
                Decision Boundary
              </text>
            </svg>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className={`text-xl font-extrabold ${gradientText}`}>{c.boundaryTitle}</h3>
                <p className="mt-3 leading-relaxed text-white/70">{c.boundaryBody}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/50">{c.signalsTitle}</h3>
                <ul className="mt-3 grid gap-2">
                  {c.signals.map((s) => (
                    <li key={s} className="flex items-center gap-2.5 text-white/85">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF7DFD]" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <HowWeMeasure />

        {/* 작동 방식 */}
        <section id="how" className="scroll-mt-6 border-y border-white/5 bg-black/20">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <Eyebrow>{c.howEyebrow}</Eyebrow>
            <h2 className="text-2xl font-extrabold sm:text-4xl">{c.howTitle}</h2>
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <ol className="grid gap-6">
                {c.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F07CF8] to-[#A855F7] font-[Inter] font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-white/65">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="grid grid-cols-[0.62fr_1fr] items-start gap-4">
                <Shot src={popupShot} alt="HANDOFF popup" />
                <div className="grid gap-4">
                  <Shot src={dataShot} alt="HANDOFF data summary" />
                  <Shot src={usageShot} alt="HANDOFF usage by tool" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4가지 스타일 */}
        <section id="styles" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl">
            <Eyebrow>{c.stylesEyebrow}</Eyebrow>
            <h2 className="text-2xl font-extrabold sm:text-4xl">{c.stylesTitle}</h2>
            <p className="mt-4 leading-relaxed text-white/65">{c.stylesBody}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {STYLES.map((style) => {
              const content = TYPE_CONTENTS[style.code][language];
              return (
                <article
                  key={style.code}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/0 p-7"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl"
                    style={{ background: style.accent, opacity: 0.18 }}
                  />
                  <div className="relative flex items-start gap-5">
                    <img src={style.icon} alt="" className="h-16 w-16 shrink-0" />
                    <div>
                      <h3 className="font-[Inter] text-xl font-bold">{style.name}</h3>
                      <p className="mt-1 text-sm font-semibold" style={{ color: style.accent }}>
                        {content.tagline}
                      </p>
                    </div>
                  </div>
                  <p className="relative mt-5 leading-relaxed text-white/70">{content.summary}</p>
                  <p className="relative mt-4 text-sm text-white/45">“{content.catchphrase}”</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* 리포트 */}
        <section className="border-y border-white/5 bg-black/20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-24">
            <Shot src={reportShot} alt="HANDOFF analysis report" />
            <div>
              <Eyebrow>{c.resultEyebrow}</Eyebrow>
              <h2 className="text-2xl font-extrabold sm:text-4xl">{c.resultTitle}</h2>
              <dl className="mt-8 grid gap-5">
                {c.resultItems.map((item) => (
                  <div key={item.title} className="border-l-2 border-[#A36EFF]/60 pl-4">
                    <dt className="font-bold">{item.title}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-white/60">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 평가 도구가 아님 */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="text-center">
            <Eyebrow>{c.notEyebrow}</Eyebrow>
            <h2 className="text-2xl font-extrabold sm:text-4xl">{c.notTitle}</h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#2B2930] p-7">
              <h3 className="text-sm font-semibold text-white/50">{c.doesNot}</h3>
              <ul className="mt-4 grid gap-3">
                {c.doesNotItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DF6E4E]/15 text-sm text-[#F08A6C]">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#A36EFF]/40 bg-[#A36EFF]/10 p-7">
              <h3 className="text-sm font-semibold text-[#D9C2FF]">{c.does}</h3>
              <ul className="mt-4 grid gap-3">
                {c.doesItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A36EFF]/30 text-sm text-white">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 개인정보 */}
        <section id="privacy" className="scroll-mt-6 border-y border-white/5 bg-black/20">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <Eyebrow>{c.privacyEyebrow}</Eyebrow>
            <h2 className="text-2xl font-extrabold sm:text-4xl">{c.privacyTitle}</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {c.privacyItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-[#2B2930] p-6">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{item.body}</p>
                </div>
              ))}
            </div>
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block text-sm text-[#C59BFF] hover:underline">
              {c.privacyLink} →
            </a>
          </div>
        </section>

        {/* 설문 */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#3A2259] via-[#2B2140] to-[#211F26] p-7 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <Eyebrow>{c.surveyEyebrow}</Eyebrow>
              <h2 className="text-2xl font-extrabold sm:text-4xl">{c.surveyTitle}</h2>
              <p className="mt-4 leading-relaxed text-white/70">{c.surveyBody}</p>
              <Link
                to="/survey-intro"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 font-bold text-[#211F26] transition-opacity hover:opacity-90"
              >
                {c.surveyCta} →
              </Link>
            </div>
            <Shot src={surveyShot} alt="HANDOFF survey" />
          </div>
        </section>

        {/* 마무리 */}
        <section className="mx-auto max-w-4xl px-4 pb-24 text-center sm:px-6">
          <img src={AppLogo} alt="" className="mx-auto h-16 w-16 rounded-2xl" />
          <p className="mt-8 text-2xl font-extrabold leading-snug sm:text-3xl">
            {c.closing[0]}
            <br />
            <span className={gradientText}>{c.closing[1]}</span>
          </p>
          <p className="mt-4 font-[Inter] text-sm text-white/45">We study how humans and AI collaborate — not just how AI performs.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <InstallButton label={c.install} />
            <Link
              to="/survey-intro"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
            >
              {c.tryWithout} →
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>{c.footerTeam}</span>
          <div className="flex flex-wrap gap-5">
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">{c.demo}</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">{c.nav.privacy}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
