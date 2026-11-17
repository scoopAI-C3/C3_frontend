import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { PRIVACY_URL } from "../constants/links";
import {
  CONSENT_VERSION,
  DETAIL_MODE_KEY,
  isExpired,
  remainingText,
  scopeUntil,
  type DetailMode,
  type DetailScope,
} from "../local/detailMode";

interface PageInfo {
  tabId: number;
  host: string;
  path: string;
  isHome: boolean;
}

const COPY = {
  ko: {
    title: "상세 분석",
    offBody: "동의하면 질문 내용으로 요청 유형까지 분석해 더 정확한 결과를 볼 수 있어요.",
    turnOn: "상세 분석 켜기",
    on: "켜짐",
    turnOff: "끄기",
    consentTitle: "상세 분석 동의",
    readTitle: "읽는 것",
    read: ["내가 보낸 질문의 텍스트", "AI 답변의 글자 수"],
    doTitle: "하는 일",
    do: ["질문을 요청 유형(실행·의견·검증·수정·정보)으로 분류", "긴 답변을 몇 초 만에 넘겼는지 확인"],
    dontTitle: "하지 않는 것",
    dont: [
      "질문 텍스트를 저장하지 않습니다. 분류한 뒤 바로 버립니다.",
      "텍스트를 서버나 AI로 보내지 않습니다. 리포트 문장을 만들 때 유형별 개수만 씁니다.",
      "아래에서 고른 범위 밖에서는 읽지 않습니다.",
    ],
    scopeTitle: "범위",
    scopes: {
      conversation: "지금 이 대화만",
      "30m": "30분 동안",
      "1h": "1시간 동안",
      today: "오늘 하루 (자정까지)",
    } as Record<DetailScope, string>,
    conversationUnavailable: "AI 사이트의 대화 화면에서 팝업을 열면 선택할 수 있어요.",
    newConversation: "새 대화를 시작하면 그 대화에만 적용돼요.",
    agree: "위 내용을 확인했으며, 상세 분석에 동의합니다.",
    privacy: "개인정보처리방침",
    cancel: "취소",
    start: "동의하고 시작",
    hint: "켜져 있는 동안 AI 사이트 오른쪽 아래에 표시가 보이고, 거기서도 끌 수 있어요.",
  },
  en: {
    title: "Detailed analysis",
    offBody: "With your consent, HANDOFF also classifies what you ask for a more precise result.",
    turnOn: "Turn on",
    on: "On",
    turnOff: "Turn off",
    consentTitle: "Consent to detailed analysis",
    readTitle: "What it reads",
    read: ["The text of prompts you send", "The length of AI answers"],
    doTitle: "What it does",
    do: ["Classifies each prompt as do / opinion / check / revise / info", "Checks whether long answers were skipped in seconds"],
    dontTitle: "What it doesn't do",
    dont: [
      "It doesn't store prompt text. Text is discarded right after classification.",
      "It doesn't send text to any server or AI. Only counts per type are used for report sentences.",
      "It doesn't read anything outside the scope you choose below.",
    ],
    scopeTitle: "Scope",
    scopes: {
      conversation: "This conversation only",
      "30m": "For 30 minutes",
      "1h": "For 1 hour",
      today: "Today (until midnight)",
    } as Record<DetailScope, string>,
    conversationUnavailable: "Open the popup on an AI site's chat to choose this.",
    newConversation: "Applies only to the conversation you start next.",
    agree: "I have read the above and agree to detailed analysis.",
    privacy: "Privacy policy",
    cancel: "Cancel",
    start: "Agree and start",
    hint: "While it's on, an indicator shows at the bottom right of the AI site, where you can also turn it off.",
  },
};

async function readPageInfo(): Promise<PageInfo | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;
    const info = (await chrome.tabs.sendMessage(tab.id, { type: "HANDOFF_GET_PAGE" })) as Omit<PageInfo, "tabId"> | undefined;
    return info ? { tabId: tab.id, ...info } : null;
  } catch {
    // AI 사이트가 아니면 content script가 없어 응답이 없다
    return null;
  }
}

interface DetailModeCardProps {
  /** 동의 화면이 열리고 닫힐 때 (팝업이 다른 내용을 숨기도록) */
  onConsentViewChange: (open: boolean) => void;
}

const DetailModeCard = ({ onConsentViewChange }: DetailModeCardProps) => {
  const { language } = useLanguage();
  const c = COPY[language];
  const [mode, setMode] = useState<DetailMode | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [page, setPage] = useState<PageInfo | null>(null);
  const [scope, setScope] = useState<DetailScope>("1h");
  const [agreed, setAgreed] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = (await chrome.storage.local.get(DETAIL_MODE_KEY)) as { [DETAIL_MODE_KEY]?: DetailMode };
      const stored = data[DETAIL_MODE_KEY] ?? null;
      if (stored && isExpired(stored)) {
        await chrome.storage.local.remove(DETAIL_MODE_KEY);
        setMode(null);
      } else {
        setMode(stored);
      }
    };
    load();
    const onChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (DETAIL_MODE_KEY in changes) setMode((changes[DETAIL_MODE_KEY].newValue as DetailMode | undefined) ?? null);
    };
    chrome.storage.onChanged.addListener(onChange);
    const timer = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => {
      chrome.storage.onChanged.removeListener(onChange);
      clearInterval(timer);
    };
  }, []);

  const openConsent = async () => {
    const info = await readPageInfo();
    setPage(info);
    setScope(info ? "conversation" : "1h");
    setAgreed(false);
    setConsentOpen(true);
    onConsentViewChange(true);
  };

  const closeConsent = () => {
    setConsentOpen(false);
    onConsentViewChange(false);
  };

  const start = async () => {
    if (!agreed) return;
    const now = Date.now();
    const next: DetailMode = {
      consentVersion: CONSENT_VERSION,
      consentedAt: now,
      scope,
      until: scopeUntil(scope, now),
      ...(scope === "conversation" && page
        ? { conversation: { host: page.host, path: page.isHome ? null : page.path } }
        : {}),
    };
    await chrome.storage.local.set({ [DETAIL_MODE_KEY]: next });
    if (scope === "conversation" && page?.isHome) {
      // 새 대화 화면이면 이 탭에만 "다음에 생기는 대화에 묶어라"라고 알린다
      await chrome.tabs.sendMessage(page.tabId, { type: "HANDOFF_BIND_PENDING" }).catch(() => undefined);
    }
    setMode(next);
    closeConsent();
  };

  const turnOff = () => chrome.storage.local.remove(DETAIL_MODE_KEY);

  if (consentOpen) {
    const scopes: DetailScope[] = ["conversation", "30m", "1h", "today"];
    return (
      <div className="flex flex-col gap-4 text-white">
        <h2 className="text-lg font-semibold">{c.consentTitle}</h2>
        {[
          { title: c.readTitle, items: c.read, mark: "•", color: "text-white/80" },
          { title: c.doTitle, items: c.do, mark: "•", color: "text-white/80" },
          { title: c.dontTitle, items: c.dont, mark: "✕", color: "text-white/80" },
        ].map((block) => (
          <div key={block.title}>
            <p className="mb-1.5 text-xs font-semibold text-[#C59BFF]">{block.title}</p>
            <ul className="grid gap-1 text-[13px] leading-snug">
              {block.items.map((item) => (
                <li key={item} className={`flex gap-2 ${block.color}`}>
                  <span className="text-white/40">{block.mark}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-[#C59BFF]">{c.scopeTitle}</legend>
          <div className="grid gap-1.5">
            {scopes.map((value) => {
              const disabled = value === "conversation" && !page;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${
                    scope === value ? "bg-[#A36EFF]/25 ring-1 ring-[#A36EFF]" : "bg-white/5"
                  } ${disabled ? "opacity-40" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    name="detail-scope"
                    value={value}
                    checked={scope === value}
                    disabled={disabled}
                    onChange={() => setScope(value)}
                    className="accent-[#A36EFF]"
                  />
                  {c.scopes[value]}
                </label>
              );
            })}
          </div>
          {!page && <p className="mt-1.5 text-[11px] text-white/45">{c.conversationUnavailable}</p>}
          {page?.isHome && scope === "conversation" && <p className="mt-1.5 text-[11px] text-white/45">{c.newConversation}</p>}
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/15 p-3 text-[13px]">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#A36EFF]" />
          <span>
            {c.agree}{" "}
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-[#C59BFF] underline">
              {c.privacy}
            </a>
          </span>
        </label>

        <div className="flex gap-2">
          <button onClick={closeConsent} className="flex-1 cursor-pointer rounded-xl bg-white/10 py-2.5 text-sm font-medium hover:bg-white/15">
            {c.cancel}
          </button>
          <button
            onClick={start}
            disabled={!agreed}
            className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-[#F07CF8] to-[#A855F7] py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {c.start}
          </button>
        </div>
        <p className="text-[11px] leading-snug text-white/40">{c.hint}</p>
      </div>
    );
  }

  const active = mode && !isExpired(mode);
  return (
    <div className="rounded-2xl bg-[#2B2930] p-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">{c.title}</span>
        {active ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#FF9BFD]">
            <span className="h-2 w-2 rounded-full bg-[#FF7DFD] shadow-[0_0_8px_#FF7DFD]" />
            {c.on}
          </span>
        ) : null}
      </div>
      {active && mode ? (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-white/60">{remainingText(mode, language)}</span>
          <button onClick={turnOff} className="cursor-pointer rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15">
            {c.turnOff}
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[13px] leading-snug text-white/55">{c.offBody}</p>
          <button
            onClick={openConsent}
            className="mt-3 w-full cursor-pointer rounded-xl border border-[#A36EFF]/60 py-2 text-sm font-medium text-[#D9C2FF] hover:bg-[#A36EFF]/15"
          >
            {c.turnOn}
          </button>
        </>
      )}
    </div>
  );
};

export default DetailModeCard;
