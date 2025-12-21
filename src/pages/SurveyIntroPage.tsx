import { useNavigate } from 'react-router-dom';
import TextLogo from '../assets/TextLogo.png';
import surveyIntroBg from '../assets/surveyIntroBg.png';
import { useLanguage } from '../contexts/LanguageContext';

const SurveyIntroPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={surveyIntroBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#211F26]" />

      {/* Background Image on top */}
      <img
        src={surveyIntroBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-30"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-full h-full">
        {/* Header */}
        <header className="pt-[42px] pl-[62px]">
          <img className="w-[184px] h-[37px]" src={TextLogo} alt="Text Logo" />
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center flex-1 w-full">
          {/* Title */}
          <h1 className="text-[62px] font-bold text-white font-[NanumSquareRoundOTF] leading-[70px] mb-[31px]">
            {language === 'ko' ? (
              <>
                당신은{' '}
                <span className="bg-gradient-to-r from-[#E96CFF] via-[#E96CFF] to-[#385AFF] bg-clip-text text-transparent">
                  AI와 어떻게 협업하고
                </span>{' '}
                있나요?
              </>
            ) : (
              <>
                How do you{' '}
                <span className="bg-gradient-to-r from-[#E96CFF] via-[#E96CFF] to-[#385AFF] bg-clip-text text-transparent">
                  collaborate with AI
                </span>
                ?
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-white/[0.58] text-[22px] font-[Inter] leading-[38px] mb-[19px] max-w-[722px] text-center">
            {language === 'ko' ? (
              <>
                이 설문은 당신이 AI를 어떤 순간에, 어떤 역할로 사용하는지를 알아보기
                <br />
                위한 간단한 테스트입니다. 정답은 없으며, 평소의 사용 방식을 그대로 떠올리며
                <br />
                답해주세요.
              </>
            ) : (
              <>
                This survey is a simple test to find out when and how you use AI.
                <br />
                There are no right or wrong answers. Just think about how you normally use AI
                <br />
                and answer honestly.
              </>
            )}
          </p>

          {/* Start Button */}
          <button
            onClick={() => navigate('/survey')}
            className="w-[337px] h-[98px] rounded-[28px] bg-gradient-to-r from-[#C930C7] to-[#A36EFF] text-white text-[26px] font-medium font-[Inter] cursor-pointer hover:opacity-90 transition-opacity"
          >
            {language === 'ko' ? '설문 시작하기' : 'Start Survey'}
          </button>
        </main>
      </div>
    </div>
  );
};

export default SurveyIntroPage;
