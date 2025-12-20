import PrimaryStyleTypeCard from "../PrimaryStyleTypeCard";
import ScrollReveal from "../ScrollReveal";
import bgImage from "../../assets/bg.svg";
import TextLogo from "../../assets/TextLogo.png";
import type { PrimaryStyle, StyleDetail } from "../../types/session";

interface StyleResultSectionProps {
  primaryStyle: PrimaryStyle;
  styleDetail: StyleDetail;
}

const StyleResultSection = ({ primaryStyle, styleDetail }: StyleResultSectionProps) => {
  return (
    <section
      className="flex flex-col items-center w-screen min-h-screen bg-cover bg-center bg-no-repeat py-20"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <header className="flex items-center justify-start w-full px-12 pb-10">
        <img className="w-44 h-9" src={TextLogo} alt="Text Logo" />
      </header>
      <div className="flex flex-col items-start w-[676px]">
        <ScrollReveal animation="fadeUp" delay={0}>
          <PrimaryStyleTypeCard primaryStyle={primaryStyle} styleDetail={styleDetail} />
        </ScrollReveal>
        <ScrollReveal animation="fadeUp" delay={200}>
          <h1 className="text-left text-4xl font-bold mt-12 mb-6">
            당신의{" "}
            <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#FF7DFD_81%,#A36EFF_100%)]">
              AI 협업
            </span>{" "}
            스타일은?
          </h1>
          <p className="text-left text-white/70 font-normal text-lg">
            "{styleDetail.todayMessage}"
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StyleResultSection;
