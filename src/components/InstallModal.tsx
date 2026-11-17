import { useLanguage } from "../contexts/LanguageContext";
import { INSTALL_URL, IS_STORE_LISTED } from "../constants/links";

const AI_SITES = [
  { name: "ChatGPT", url: "https://chat.openai.com", color: "#10A37F" },
  { name: "Claude", url: "https://claude.ai", color: "#D97706" },
  { name: "Gemini", url: "https://gemini.google.com", color: "#4285F4" },
];


interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal = ({ isOpen, onClose }: InstallModalProps) => {
  const { language } = useLanguage();

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
          <h2 className="text-white text-2xl font-bold">
            {language === 'ko' ? '확장 프로그램 설치 필요' : 'Extension Installation Required'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="text-white/70 mb-6">
          {language === 'ko'
            ? 'AI 협업 분석을 시작하려면 HANDOFF 확장 프로그램이 필요합니다. 아래 단계를 따라 설치해주세요.'
            : 'To start AI collaboration analysis, you need the HANDOFF extension. Please follow the steps below to install.'}
        </p>

        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">1</span>
            <span className="text-white font-semibold">{language === 'ko' ? 'Chrome에 설치' : 'Install on Chrome'}</span>
          </div>
          <ul className="text-white/60 text-sm space-y-2 ml-10">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
              <a
                href={INSTALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A855F7] hover:underline inline-flex items-center gap-1"
              >
                {IS_STORE_LISTED
                  ? (language === 'ko' ? 'Chrome 웹 스토어에서 설치' : 'Install from the Chrome Web Store')
                  : (language === 'ko' ? 'GitHub에서 확장 프로그램 다운로드' : 'Download extension from GitHub')}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
            {!IS_STORE_LISTED && (<>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
              <span>{language === 'ko' ? '주소창에' : 'Enter'} <code className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/80">chrome://extensions</code> {language === 'ko' ? '입력' : 'in the address bar'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
              <span>{language === 'ko' ? '우측 상단' : 'Enable'} <span className="text-[#A855F7]">{language === 'ko' ? '"개발자 모드"' : '"Developer mode"'}</span> {language === 'ko' ? '활성화' : 'at the top right'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
              <span>{language === 'ko' ? '' : 'Click '}<span className="text-[#A855F7]">{language === 'ko' ? '"압축해제된 확장 프로그램을 로드합니다"' : '"Load unpacked"'}</span>{language === 'ko' ? ' 클릭' : ''}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
              <span>{language === 'ko' ? '다운로드한 폴더 선택' : 'Select the downloaded folder'}</span>
            </li>
            </>)}
          </ul>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">2</span>
            <span className="text-white font-semibold">{language === 'ko' ? 'AI 사이트에서 작업 시작' : 'Start working on AI sites'}</span>
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
