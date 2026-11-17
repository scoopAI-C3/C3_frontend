import { useNavigate } from "react-router-dom";
import TextLogo from "../../assets/TextLogo.png";
import { useLanguage } from "../../contexts/LanguageContext";

const SITES = [
  { name: "ChatGPT", url: "https://chatgpt.com" },
  { name: "Claude", url: "https://claude.ai" },
  { name: "Gemini", url: "https://gemini.google.com" },
];

/** 아직 분석할 기록이 없을 때 (빈 화면 대신) */
const EmptyResult = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ko = language === "ko";

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-[#211F26] px-6 text-center text-white">
      <img src={TextLogo} alt="HANDOFF" className="mb-10 h-8 w-auto" />
      <h1 className="text-2xl font-bold sm:text-3xl">{ko ? "아직 분석할 기록이 없어요" : "Nothing to analyze yet"}</h1>
      <p className="mt-4 max-w-md leading-relaxed text-white/65">
        {ko
          ? "아래 AI 사이트에서 평소처럼 질문을 몇 번 해 보세요. 질문과 답변 시각이 쌓이면 여기에서 바로 결과를 볼 수 있어요."
          : "Ask a few questions on one of the AI sites below as you normally would. Once some activity is recorded, your result appears here."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {SITES.map((site) => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white/10 px-5 py-2.5 font-semibold transition-colors hover:bg-white/15"
          >
            {site.name}
          </a>
        ))}
      </div>
      <button
        onClick={() => navigate("/survey-intro")}
        className="mt-6 cursor-pointer text-sm text-[#C59BFF] hover:underline"
      >
        {ko ? "기다리기 싫다면, 10문항 설문으로 먼저 해 보기 →" : "Don't want to wait? Try the 10-question survey →"}
      </button>
    </div>
  );
};

export default EmptyResult;
