import TextLogo from '../assets/TextLogo.png';
import Logo from '../assets/appLogo.png';
import Arrow from '../assets/arrow-right.svg';
import { analyzeSession } from '../apis/session';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const handleAnalyze = async () => {
    const data = await chrome.storage.local.get(['sessionId']) as { sessionId?: string };
    if (data.sessionId) {
      await analyzeSession({ sessionId: data.sessionId });
      navigate('/dashboard');
    }
  }
  return (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-[#211F26] py-10">
      <header className="flex items-center justify-between w-full px-12 pb-10">
        <img className="w-44 h-9" src={TextLogo} alt="Text Logo" />
        <h3 className="text-white/70 text-base font-bold cursor-pointer">KR</h3>
      </header>
      <main className="flex flex-col items-center font-[NanumSquareRound] text-white">
        <img className="w-36 h-36 rounded-2xl mb-10" src={Logo} alt="Landing" />
        <h1 className="text-5xl font-bold mb-6">당신은 AI와 어떻게 협업하고 있나요?</h1>
        <p className="text-center text-lg mb-15 leading-10">
          AI Collaboration Profile은 당신의 작업 로그를 분석하여
          <br />
          인간과 AI 사이의 '결정 경계'를 찾아냅니다.
        </p>
        <div className="flex flex-row gap-10 font-[Inter]">
            <button className='flex flex-row items-center justify-between gap-5 px-8 py-6 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-3xl text-xl font-semibold leading-10 cursor-pointer' onClick={handleAnalyze}>Start Observation
              <img className="w-6 h-6 bg-blend-color-dodge" src={Arrow} alt="Arrow" />
            </button>
            <button className="px-8 py-6 rounded-3xl bg-white border-[3px] border-[#DFDFDF] text-xl font-semibold text-[#979797] cursor-pointer">View Demo Result</button>
        </div>
      </main>
    </div>
  );
};
export default LandingPage;
