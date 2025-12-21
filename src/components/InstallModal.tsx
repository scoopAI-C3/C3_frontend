const AI_SITES = [
  { name: "ChatGPT", url: "https://chat.openai.com", color: "#10A37F" },
  { name: "Claude", url: "https://claude.ai", color: "#D97706" },
  { name: "Gemini", url: "https://gemini.google.com", color: "#4285F4" },
  { name: "Copilot", url: "https://copilot.microsoft.com", color: "#9333EA" },
];

const GITHUB_RELEASE_URL = "https://github.com/scoopAI-C3/C3_frontend";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal = ({ isOpen, onClose }: InstallModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#2D2B33] rounded-3xl p-8 max-w-lg w-full mx-4 my-8 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">확장 프로그램 설치 필요</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="text-white/70 mb-6">
          AI 협업 분석을 시작하려면 HANDOFF 확장 프로그램이 필요합니다.
          아래 단계를 따라 설치해주세요.
        </p>

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
      </div>
    </div>
  );
};

export default InstallModal;
