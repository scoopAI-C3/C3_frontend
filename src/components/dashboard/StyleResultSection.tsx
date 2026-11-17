import PrimaryStyleTypeCard from "../PrimaryStyleTypeCard";
import ScrollReveal from "../ScrollReveal";
import bgImage from "../../assets/bg.svg";
import TextLogo from "../../assets/TextLogo.png";
import type { PrimaryStyle, StyleDetail } from "../../types/session";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

interface StyleResultSectionProps {
  primaryStyle: PrimaryStyle;
  styleDetail: StyleDetail;
}

const StyleResultSection = ({ primaryStyle, styleDetail }: StyleResultSectionProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  return (
    <section
      className="flex flex-col items-center w-screen min-h-screen bg-cover bg-center bg-no-repeat py-20"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <header className="flex items-center justify-start w-full px-12 pb-10 cursor-pointer">
        <img className="w-44 h-9 cursor-pointer" onClick={() => navigate('/landing')} src={TextLogo} alt="Text Logo" />
      </header>
      <div className="flex flex-col items-start w-[676px]">
        <ScrollReveal animation="fadeUp" delay={0}>
          <PrimaryStyleTypeCard primaryStyle={primaryStyle} styleDetail={styleDetail} />
        </ScrollReveal>
        <ScrollReveal animation="fadeUp" delay={200}>
          <h1 className="text-left text-4xl font-bold mt-12 mb-6">
            {language === 'ko' ? (
              <>
                당신의{" "}
                <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#FF7DFD_81%,#A36EFF_100%)]">
                  AI 협업
                </span>{" "}
                스타일은?
              </>
            ) : (
              <>
                What is your{" "}
                <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#FF7DFD_81%,#A36EFF_100%)]">
                  AI Collaboration
                </span>{" "}
                Style?
              </>
            )}
          </h1>
          <p className="text-left text-white/70 font-normal text-lg">
            "{styleDetail.todayMessage}"
          </p>
        </ScrollReveal>
      </div>
      {/* 첫 화면에서 결과가 끝난 것처럼 보이지 않도록 아래에 더 있다는 표시 */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })}
        className="mt-auto flex cursor-pointer flex-col items-center gap-1 pt-16 text-sm text-white/60 hover:text-white"
      >
        {language === 'ko' ? '데이터 분석, 강점과 주의점, 타임라인 보기' : 'See data, strengths and timeline'}
        <span className="animate-bounce text-lg">↓</span>
      </button>
    </section>
  );
};

export default StyleResultSection;
