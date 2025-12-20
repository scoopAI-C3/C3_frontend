import ScrollReveal from "../ScrollReveal";
import bgImage from "../../assets/bg3.svg";

interface StrengthWeaknessSectionProps {
  detailStrengths: string[];
  detailCautions: string[];
  tip: string;
}

const StrengthWeaknessSection = ({
  detailStrengths,
  detailCautions,
}: StrengthWeaknessSectionProps) => {
  return (
    <section
      className="flex flex-col items center justify-center w-screen min-h-screen bg-cover bg-center bg-no-repeat py-20"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <ScrollReveal animation="fadeUp" delay={0}>
        <div className="flex items-stretch pl-16 mb-16">
          <div className="w-1 bg-white/70 mr-8 self-stretch"></div>
          <div className="flex flex-col">
            <h2 className="text-fuchsia-400 text-3xl font-extrabold font-[Inter] mb-4">
              이 협업 스타일은 이런 상황에서 강합니다
            </h2>
            <ul className="text-white/70 list-disc list-inside text-lg">
              {detailStrengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fadeUp" delay={200}>
        <div className="flex items-stretch justify-end pr-16">
          <div className="w-1 bg-white/70 mr-8 self-stretch"></div>
          <div className="flex flex-col">
            <h2 className="text-white text-3xl font-extrabold font-[Inter] mb-4">
              이런 상황에서는 주의가 필요합니다
            </h2>
            <ul className="text-white/70 list-disc list-inside text-lg">
              {detailCautions.map((caution, index) => (
                <li key={index}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default StrengthWeaknessSection;
