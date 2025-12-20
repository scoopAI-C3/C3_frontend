import ScrollReveal from "../ScrollReveal";
import type { PrimaryStyle, StyleDetail } from "../../types/session";
import TypeImage from "../../assets/type.svg";
interface DetailResultSectionProps {
  primaryStyle: PrimaryStyle;
  styleDetail: StyleDetail;
}

const DetailResultSection = ({
  primaryStyle,
  styleDetail,
}: DetailResultSectionProps) => {
  return (
    <section className="flex w-screen min-h-screen">
      <ScrollReveal animation="fadeUp" delay={0}>
        <div className="flex items-center">
          <div className="flex-shrink-0 w-[40vw] h-screen">
            <img
              src={TypeImage}
              alt="Type Image"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6  px-16">
            <h2 className="text-3xl font-bold font-[Inter] text-white">
              {primaryStyle.displayName}
              <br />
              <span className="text-white">"{styleDetail.tagline}"</span>
            </h2>
            <div className="text-white/70 text-base leading-relaxed">
              <p className="whitespace-pre-line">{styleDetail.summary}</p>
            </div>
            <p className="text-fuchsia-400 text-xl font-semibold font-[Inter] mt-2">
              → {styleDetail.catchphrase}
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default DetailResultSection;
