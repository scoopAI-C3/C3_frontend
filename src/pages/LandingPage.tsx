import { useState, useEffect } from "react";
import TextLogo from "../assets/TextLogo.png";
import Logo from "../assets/appLogo.png";
import Arrow from "../assets/arrow-right.svg";
import { analyzeSession } from "../apis/session";
import { useNavigate } from "react-router-dom";

const AI_SITES = [
  { name: "ChatGPT", url: "https://chat.openai.com", color: "#10A37F" },
  { name: "Claude", url: "https://claude.ai", color: "#D97706" },
  { name: "Gemini", url: "https://gemini.google.com", color: "#4285F4" },
  { name: "Copilot", url: "https://copilot.microsoft.com", color: "#9333EA" },
];

const GITHUB_RELEASE_URL = "https://github.com/scoopAI-C3/C3_frontend";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  // 확장 프로그램 설치 여부 확인
  useEffect(() => {
    const checkExtension = () => {
      // chrome.storage가 있으면 확장 프로그램 환경
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        setIsExtensionInstalled(true);
      } else {
        setIsExtensionInstalled(false);
      }
    };
    checkExtension();
  }, []);

  const handleAnalyze = async () => {
     if (!isExtensionInstalled) {
      setShowInstallModal(true);
      return;
    }

    try {
      const data = (await chrome.storage.local.get(["sessionId"])) as {
        sessionId?: string;
      };
      if (data.sessionId) {
        await analyzeSession({ sessionId: data.sessionId });
        navigate("/dashboard");
      } else {
        // sessionId가 없으면 AI 사이트로 이동 안내
        setShowInstallModal(true);
      }
    } catch {
      // chrome API 접근 실패 시 설치 모달 표시
      setShowInstallModal(true);
    }
  };
  return (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-[#211F26] py-10 overflow-hidden">
      <header className="flex items-center justify-between w-full px-12 pb-10">
        <img
          className="w-44 h-9 cursor-pointer"
          onClick={() => navigate("/landing")}
          src={TextLogo}
          alt="Text Logo"
        />
        <div className="flex items-center gap-4">
          <h3 className="text-white/70 text-base font-bold cursor-pointer">KR</h3>
          <div className="relative">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all text-sm font-bold"
            >
              ?
            </button>
            {showGuide && (
              <div className="absolute right-0 top-12 w-96 bg-[#2D2B33] rounded-2xl shadow-2xl border border-white/10 p-5 z-50">
                <div className="absolute -top-2 right-4 w-4 h-4 bg-[#2D2B33] border-l border-t border-white/10 transform rotate-45" />

                <h4 className="text-white font-bold text-base mb-3">확장 프로그램 설치 방법</h4>
                <ol className="text-white/60 text-sm mb-4 leading-relaxed space-y-2">
                  <li className="flex gap-2">
                    <span className="text-[#A855F7] font-bold">1.</span>
                    <span>Chrome에서 <code className="bg-white/10 px-1 rounded text-xs">chrome://extensions</code> 접속</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#A855F7] font-bold">2.</span>
                    <span>우측 상단 "개발자 모드" 활성화</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#A855F7] font-bold">3.</span>
                    <span>"압축해제된 확장 프로그램을 로드합니다" 클릭</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#A855F7] font-bold">4.</span>
                    <span>빌드된 <code className="bg-white/10 px-1 rounded text-xs">dist</code> 폴더 선택</span>
                  </li>
                </ol>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/40 text-xs mb-3">설치 후, AI 사이트에서 작업을 시작하세요</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_SITES.map((site) => (
                      <a
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: site.color }}
                        />
                        <span className="text-white/80 text-sm">{site.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex flex-col items-center font-[NanumSquareRound] text-white">
        <img className="w-36 h-36 rounded-2xl mb-10" src={Logo} alt="Landing" />
        <h1 className="text-5xl font-bold mb-6">
          당신은 AI와 어떻게 협업하고 있나요?
        </h1>
        <p className="text-center text-lg mb-15 leading-10">
          AI Collaboration Profile은 당신의 작업 로그를 분석하여
          <br />
          인간과 AI 사이의 '결정 경계'를 찾아냅니다.
        </p>
        <div className="flex flex-row gap-10 font-[Inter]">
          <button
            className="flex flex-row items-center justify-center gap-5 px-6 py-4 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-3xl text-xl font-semibold leading-10 cursor-pointer w-70"
            onClick={handleAnalyze}
          >
            Start Observation
            <img
              className="w-6 h-6 bg-blend-color-dodge"
              src={Arrow}
              alt="Arrow"
            />
          </button>
          <button
            className="px-8 py-6 rounded-3xl bg-white border-[3px] border-[#DFDFDF] text-xl font-semibold text-[#979797] cursor-pointer hover:bg-gray-50 transition-colors w-70"
            onClick={() => navigate("/survey-intro")}
          >
            Start Survey
          </button>
        </div>
      </main>

      {/* 확장 프로그램 설치 안내 모달 */}
      {showInstallModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="bg-[#2D2B33] rounded-3xl p-8 max-w-lg w-full mx-4 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">확장 프로그램 설치 필요</h2>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-white/50 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* 설명 */}
            <p className="text-white/70 mb-6">
              AI 협업 분석을 시작하려면 HANDOFF 확장 프로그램이 필요합니다.
              아래 단계를 따라 설치해주세요.
            </p>

            {/* Step 1: 설치 방법 */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">1</span>
                <span className="text-white font-semibold">Chrome에 설치</span>
              </div>
              <ul className="text-white/60 text-sm space-y-2 ml-10">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                  <a
                    href={GITHUB_RELEASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A855F7] hover:underline inline-flex items-center gap-1"
                  >
                    GitHub에서 확장 프로그램 다운로드
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                  <span>주소창에 <code className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/80">chrome://extensions</code> 입력</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                  <span>우측 상단 <span className="text-[#A855F7]">"개발자 모드"</span> 활성화</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                  <span><span className="text-[#A855F7]">"압축해제된 확장 프로그램을 로드합니다"</span> 클릭</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                  <span>다운로드한 폴더 선택</span>
                </li>
              </ul>
            </div>

            {/* Step 2: AI 사이트 이동 */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">2</span>
                <span className="text-white font-semibold">AI 사이트에서 작업 시작</span>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-10">
                {AI_SITES.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: site.color }}
                    />
                    <span className="text-white/80 text-sm">{site.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingPage;
