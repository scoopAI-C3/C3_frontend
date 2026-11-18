import { useLanguage } from "../../contexts/LanguageContext";
import consentShot from "../../assets/home/consent.webp";
import { INTENT_LABELS } from "../../local/intent";

/**
 * 소개 페이지: "프롬프트를 안 보는데 어떻게 판단하나요?"에 대한 답.
 * 실제 분석(src/local/analyze.ts)이 재는 두 가지(생각 시간, 이어 묻기)와
 * 그 두 축으로 스타일이 정해지는 방식을 그대로 보여 준다.
 */

const COPY = {
  ko: {
    eyebrow: "How we measure",
    title: "프롬프트 대신 시간을 봅니다",
    lead: "무엇을 물었는지가 아니라 언제 물었는지를 기록합니다. 아래 세 시각만으로도 AI를 어떻게 쓰는지가 드러납니다.",
    timeline: {
      sent: "질문 보냄",
      writing: "AI가 답을 쓰는 중",
      writingNote: "계산에서 뺌",
      done: "답변 끝",
      thinking: "생각 시간",
      next: "다음 질문",
    },
    measuresTitle: "이 시각들로 두 가지를 잽니다",
    measures: [
      {
        name: "생각 시간",
        what: "AI 답변이 끝난 뒤 다음 질문을 보내기까지 걸린 시간",
        short: "짧으면 답을 받자마자 다음으로 넘어가는 것",
        long: "길면 답을 읽고 따져 본 뒤 움직이는 것",
        note: "AI가 답을 쓰는 시간과 10분 넘게 쉰 시간은 빼고 계산합니다.",
      },
      {
        name: "이어 묻기",
        what: "한 번 대화를 시작했을 때 이어서 몇 번 묻는지",
        short: "한두 번이면 확인하고 끝내는 것",
        long: "여러 번이면 AI와 함께 풀어 가는 것",
        note: "세션 전체 횟수가 아니라 대화 한 번당 평균이라, 오래 켜 둔다고 결과가 바뀌지 않습니다.",
      },
    ],
    mapTitle: "두 값이 어디에 놓이는지로 스타일이 정해집니다",
    axisX: ["생각 시간 짧음", "생각 시간 김"],
    axisY: ["한두 번 묻고 끝", "길게 이어 물음"],
    example: {
      label: "예시",
      body: "답을 받고 평균 8초 만에 다음 질문을, 한 번에 6번씩 이어 했다면",
      result: "AI-Driven Executor",
    },
    honestTitle: "한계도 있습니다",
    honest:
      "내용을 모르니 같은 30초가 답을 읽은 시간인지 잠깐 딴짓한 시간인지는 알 수 없습니다. 그래서 점수로 평가하지 않고 경향을 스타일로 보여 주며, 더 정확히 알고 싶다면 아래 상세 분석을 켤 수 있습니다.",
    detail: {
      eyebrow: "Detailed analysis · 선택",
      title: "동의하면, 무엇을 물었는지까지",
      lead: "원하는 사람만 팝업에서 켤 수 있습니다. 동의 화면에서 읽는 것과 하지 않는 것을 확인하고, 범위를 직접 고릅니다.",
      steps: [
        { title: "동의하고 범위 선택", body: "지금 이 대화만, 오늘만, 끌 때까지 중에서 고릅니다. 켜져 있는 동안 화면에 표시가 보이고 바로 끌 수 있습니다." },
        { title: "브라우저 안에서 분류", body: "보낸 질문을 그 자리에서 요청 유형으로 나눕니다." },
        { title: "텍스트는 바로 버림", body: "질문 텍스트는 저장하지도, 서버나 AI로 보내지도 않습니다. 남는 건 유형과 글자 수뿐입니다." },
      ],
      gainsTitle: "더 보이는 것",
      gains: [
        "질문이 실행·의견·검증·수정·정보 중 어떤 요청이었는지",
        "긴 답변을 몇 초 만에 넘기고 다음으로 갔는지",
        "평균 질문 길이 (맥락을 직접 주는지, 짧게 맡기는지)",
        "요청 유형까지 반영해 더 정확해진 스타일 판정",
      ],
      indicator: "켜져 있는 동안 AI 사이트 오른쪽 위에 표시가 보이고, 거기서 바로 끌 수 있습니다.",
    },
  },
  en: {
    eyebrow: "How we measure",
    title: "We look at timing, not prompts",
    lead: "We record when you asked, not what you asked. These three moments alone show how you work with AI.",
    timeline: {
      sent: "Prompt sent",
      writing: "AI is writing",
      writingNote: "not counted",
      done: "Answer done",
      thinking: "Think time",
      next: "Next prompt",
    },
    measuresTitle: "From those moments, we measure two things",
    measures: [
      {
        name: "Think time",
        what: "Time from the end of the AI's answer to your next prompt",
        short: "Short means you move on as soon as you get the answer",
        long: "Long means you read and weigh it before acting",
        note: "Time the AI spends writing and breaks longer than 10 minutes are left out.",
      },
      {
        name: "Follow-ups",
        what: "How many prompts you send in a row once a conversation starts",
        short: "One or two means checking something and leaving",
        long: "Many means working the problem through with AI",
        note: "It's an average per conversation, not a session total, so leaving the browser open doesn't change it.",
      },
    ],
    mapTitle: "Where those two values land decides your style",
    axisX: ["Short think time", "Long think time"],
    axisY: ["Ask once or twice", "Keep following up"],
    example: {
      label: "Example",
      body: "If you send the next prompt about 8 seconds after each answer, six prompts in a row",
      result: "AI-Driven Executor",
    },
    honestTitle: "What it can't see",
    honest:
      "Since the analysis doesn't use content, we can't tell whether 30 seconds was spent reading the answer or doing something else. That's why we show a tendency as a style rather than a score, and you can turn on detailed analysis below for more precision.",
    detail: {
      eyebrow: "Detailed analysis · optional",
      title: "With your consent, what you asked too",
      lead: "Only people who want it turn it on in the popup. The consent screen shows what is read and what isn't, and you choose the scope.",
      steps: [
        { title: "Consent and choose a scope", body: "This conversation only, today only, or until you turn it off. While it's on, an indicator stays visible and you can turn it off right away." },
        { title: "Classified in your browser", body: "Each prompt you send is sorted into a request type on the spot." },
        { title: "Text is discarded", body: "Prompt text is never stored or sent to any server or AI. Only the type and length remain." },
      ],
      gainsTitle: "What you'll also see",
      gains: [
        "Whether each prompt was a do / opinion / check / revise / info request",
        "Whether you moved on from long answers within seconds",
        "Average prompt length (giving context yourself vs. handing it off briefly)",
        "A more precise style that also reflects request types",
      ],
      indicator: "While it's on, an indicator shows at the top right of the AI site, and you can turn it off right there.",
    },
  },
};

const STYLE_POINTS = [
  { name: "AI-Driven Executor", x: 18, y: 18, color: "#F59E0B" },
  { name: "AI-Assisted Thinker", x: 82, y: 18, color: "#3B82F6" },
  { name: "Balanced Collaborator", x: 50, y: 50, color: "#22C55E" },
  { name: "AI Checker", x: 50, y: 84, color: "#A78BFA" },
];

function TimelinePoint({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#A36EFF] ring-4 ring-[#2B2930]" />
      <span className="font-bold">{label}</span>
    </li>
  )
}

function TimelineVertical({ t }: { t: (typeof COPY)["ko"]["timeline"] }) {
  return (
    <ol className="relative grid gap-3 pl-1 sm:hidden">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[11px] w-px bg-white/15" />
      <TimelinePoint label={t.sent} />
      <li className="ml-7 rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-white/45">
        {t.writing} · {t.writingNote}
      </li>
      <TimelinePoint label={t.done} />
      <li className="ml-7 rounded-lg border border-[#FF7DFD] bg-[#FF7DFD]/15 px-3 py-2 text-sm font-bold text-[#FFD3FE]">
        ⏱ {t.thinking}
      </li>
      <TimelinePoint label={t.next} />
    </ol>
  )
}

function Timeline({ t }: { t: (typeof COPY)["ko"]["timeline"] }) {
  return (
    <div className="hidden sm:block">
      <svg viewBox="0 0 760 150" className="h-auto w-full" role="img" aria-label={t.thinking}>
        {/* 축 */}
        <line x1="40" y1="70" x2="720" y2="70" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" />

        {/* AI가 답을 쓰는 구간 (계산에서 뺌) */}
        <rect x="60" y="52" width="250" height="36" rx="8" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeOpacity="0.15" strokeDasharray="4 4" />
        <text x="185" y="75" textAnchor="middle" fill="#ffffff" fillOpacity="0.45" fontSize="13">{t.writing}</text>
        <text x="185" y="108" textAnchor="middle" fill="#ffffff" fillOpacity="0.35" fontSize="12">{t.writingNote}</text>

        {/* 생각 시간 구간 (재는 값) */}
        <rect x="310" y="52" width="300" height="36" rx="8" fill="#FF7DFD" fillOpacity="0.14" stroke="#FF7DFD" />
        <text x="460" y="75" textAnchor="middle" fill="#FFD3FE" fontSize="14" fontWeight="700">⏱ {t.thinking}</text>

        {/* 기록하는 세 시각 */}
        {[
          { x: 60, label: t.sent },
          { x: 310, label: t.done },
          { x: 610, label: t.next },
        ].map((point) => (
          <g key={point.x}>
            <line x1={point.x} y1="34" x2={point.x} y2="106" stroke="#A36EFF" strokeWidth="2" />
            <circle cx={point.x} cy="70" r="8" fill="#A36EFF" stroke="#211F26" strokeWidth="3" />
            <text x={point.x} y="24" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">{point.label}</text>
          </g>
        ))}
        <text x="660" y="75" fill="#ffffff" fillOpacity="0.3" fontSize="18">…</text>
      </svg>
    </div>
  );
}

function StyleMap({ axisX, axisY }: { axisX: string[]; axisY: string[] }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[380px]">
      {/* 칸 */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 bg-[#211F26]">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      </div>
      {/* 스타일 점 */}
      {STYLE_POINTS.map((p) => (
        <div
          key={p.name}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="h-3.5 w-3.5 rounded-full ring-4" style={{ background: p.color, boxShadow: `0 0 18px ${p.color}` }} />
          <span className="whitespace-nowrap rounded-md bg-black/50 px-1.5 py-0.5 font-[Inter] text-[11px] font-semibold text-white sm:text-xs">
            {p.name}
          </span>
        </div>
      ))}
      {/* 축 이름 */}
      <div className="absolute -bottom-7 left-0 right-0 flex justify-between text-[11px] text-white/50 sm:text-xs">
        <span>← {axisX[0]}</span>
        <span>{axisX[1]} →</span>
      </div>
      <span className="absolute -top-6 left-0 text-[11px] text-white/50 sm:text-xs">↑ {axisY[1]}</span>
      <span className="absolute bottom-2 left-3 text-[11px] text-white/40 sm:text-xs">↓ {axisY[0]}</span>
    </div>
  );
}

const HowWeMeasure = () => {
  const { language } = useLanguage();
  const c = COPY[language];

  return (
    <section id="measure" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 lg:py-28">
      <div className="max-w-2xl">
        <p className="mb-3 font-[Inter] text-sm font-semibold tracking-wide text-[#C59BFF]">{c.eyebrow}</p>
        <h2 className="text-2xl font-extrabold sm:text-4xl">{c.title}</h2>
        <p className="mt-4 leading-relaxed text-white/70">{c.lead}</p>
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-[#2B2930] p-5 sm:p-8">
        <TimelineVertical t={c.timeline} />
        <Timeline t={c.timeline} />
      </div>

      <h3 className="mt-14 text-lg font-bold sm:text-xl">{c.measuresTitle}</h3>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {c.measures.map((m, i) => (
          <article key={m.name} className="rounded-2xl border border-white/10 bg-[#2B2930] p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F07CF8] to-[#A855F7] font-[Inter] text-sm font-bold">
                {i + 1}
              </span>
              <h4 className="text-lg font-bold">{m.name}</h4>
            </div>
            <p className="mt-3 text-white/85">{m.what}</p>
            <ul className="mt-4 grid gap-2 text-sm text-white/65">
              <li className="flex gap-2"><span className="text-[#C59BFF]">↓</span>{m.short}</li>
              <li className="flex gap-2"><span className="text-[#C59BFF]">↑</span>{m.long}</li>
            </ul>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/45">{m.note}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <h3 className="text-lg font-bold sm:text-xl">{c.mapTitle}</h3>
          <div className="mt-6 rounded-2xl border border-[#A36EFF]/40 bg-[#A36EFF]/10 p-5">
            <p className="text-xs font-semibold text-[#D9C2FF]">{c.example.label}</p>
            <p className="mt-2 text-white/85">{c.example.body}</p>
            <p className="mt-2 font-[Inter] font-bold text-[#F5B544]">→ {c.example.result}</p>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 p-5">
            <p className="text-sm font-semibold text-white/60">{c.honestTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{c.honest}</p>
          </div>
        </div>
        <div className="px-2 pt-6 pb-10 sm:px-8">
          <StyleMap axisX={c.axisX} axisY={c.axisY} />
        </div>
      </div>
    </section>
  );
};

export default HowWeMeasure;

export const DetailAnalysis = () => {
  const { language } = useLanguage();
  const d = COPY[language].detail;
  const intents = (["execute", "opinion", "verify", "revise", "info"] as const).map((key) => INTENT_LABELS[language][key]);

  return (
    <section id="detail" className="scroll-mt-6 border-y border-white/5 bg-black/20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:py-24">
        <div>
          <p className="mb-3 font-[Inter] text-sm font-semibold tracking-wide text-[#C59BFF]">{d.eyebrow}</p>
          <h2 className="text-2xl font-extrabold sm:text-4xl">{d.title}</h2>
          <p className="mt-4 leading-relaxed text-white/70">{d.lead}</p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {d.steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-white/10 bg-[#2B2930] p-5">
                <span className="font-[Inter] text-sm font-bold text-[#C59BFF]">0{i + 1}</span>
                <h3 className="mt-1.5 font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap gap-2">
            {intents.map((label) => (
              <span key={label} className="rounded-full bg-[#A36EFF]/15 px-3 py-1 text-sm text-[#E2D2FF] ring-1 ring-[#A36EFF]/40">
                {label}
              </span>
            ))}
          </div>

          <h3 className="mt-8 text-sm font-semibold text-white/50">{d.gainsTitle}</h3>
          <ul className="mt-3 grid gap-2">
            {d.gains.map((gain) => (
              <li key={gain} className="flex gap-2.5 text-white/85">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF7DFD]" />
                {gain}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-white/45">{d.indicator}</p>
        </div>

        <img
          src={consentShot}
          alt={d.title}
          loading="lazy"
          className="mx-auto w-full max-w-[320px] rounded-2xl border border-[#A36EFF]/40 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
        />
      </div>
    </section>
  );
};
