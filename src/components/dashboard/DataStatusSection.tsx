import ScrollReveal from "../ScrollReveal";
import bgImage from "../../assets/bg2.svg";
import type { DataSummary } from "../../types/session";
import AIExecutor from "../../assets/AI-DrivenExecutor.svg";
import Question from "../../assets/Question.svg";
import Edit from "../../assets/Edit.svg";
import DecisionEvent from "../../assets/DecisionEvent.svg";
import Rectangle from "../../assets/Rectangle.svg";

interface DataStatusSectionProps {
  dataSummary: DataSummary;
  relativeStyles: Record<string, number> | null;
  aiToolUsage: Record<string, number> | null;
}

const DataStatusSection = ({ dataSummary }: DataStatusSectionProps) => {
  const cardContainerClass = "relative flex items-center justify-center w-[180px] h-[240px]";
  const textContainerClass = "relative z-10 flex flex-col items-center pt-14 px-6 pb-7 w-full h-full justify-between";
  const titleClass = "text-xl font-bold leading-tight text-center break-keep min-h-[50px] flex items-center justify-center";
  const valueClass = "text-xl font-bold leading-10 text-[#FF69FA]";

  return (
    <section
      className="flex flex-col justify-center w-screen min-h-screen bg-cover bg-center bg-no-repeat py-20"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex flex-col items-center justify-center w-full px-[55px]">
        <ScrollReveal animation="fadeUp" delay={0} className="w-fit flex flex-col items-center">
          <h2 className="w-full text-3xl font-bold mb-15 text-white text-center">
            데이터가 이렇게 말하고 있어요
          </h2>
          
  
          <div className="w-fit text-white/50 flex flex-row gap-7 flex-wrap">
            <div className={cardContainerClass}>
              <img src={Rectangle} alt="Background" className="absolute inset-0 w-full h-full object-fill" />
              <div className={textContainerClass}>
                <img className="w-16 h-16 mb-2" src={AIExecutor} alt="AI Executor" />
                <p className={titleClass}>AI 사용 빈도</p>
                <p className={valueClass}>{dataSummary.aiUsageFrequency}</p>
              </div>
            </div>

            <div className={cardContainerClass}>
              <img src={Rectangle} alt="Background" className="absolute inset-0 w-full h-full object-fill" />
              <div className={textContainerClass}>
                <img className="w-16 h-16 mb-2" src={Question} alt="Question" />
                <p className={titleClass}>질문 간 평균 간격</p>
                <p className={valueClass}>{dataSummary.avgPromptInterval}</p>
              </div>
            </div>

            <div className={cardContainerClass}>
              <img src={Rectangle} alt="Background" className="absolute inset-0 w-full h-full object-fill" />
              <div className={textContainerClass}>
                <img className="w-16 h-16 mb-2" src={Edit} alt="Edit" />
                <p className={titleClass}>수정/재질문 비율</p>
                <p className={valueClass}>{dataSummary.refinementRate}</p>
              </div>
            </div>

            <div className={cardContainerClass}>
              <img src={Rectangle} alt="Background" className="absolute inset-0 w-full h-full object-fill" />
              <div className={textContainerClass}>
                <img className="w-16 h-16 mb-2" src={DecisionEvent} alt="Decision Event" />
                <p className={titleClass}>Decision Event 발생 빈도</p>
                <p className={valueClass}>{dataSummary.decisionEventFrequency}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DataStatusSection;