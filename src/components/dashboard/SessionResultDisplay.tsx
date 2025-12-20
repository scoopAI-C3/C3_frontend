import StyleResultSection from "./StyleResultSection";
import DetailResultSection from "./DetailResultSection";
import DataStatusSection from "./DataStatusSection";
import StrengthWeaknessSection from "./StrengthWeaknessSection";
import TimelineSection from "./TimelineSection";
import type { SessionResultData } from "../../types/session";

interface SessionResultDisplayProps {
  data: SessionResultData;
  isSharedView?: boolean;
}

const SessionResultDisplay = ({ data }: SessionResultDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-start w-screen min-h-screen bg-[#211F26] overflow-y-auto">
      <main className="flex flex-col items-center font-[NanumSquareRound] text-white">
        {data.primaryStyle && data.styleDetail && (
          <StyleResultSection
            primaryStyle={data.primaryStyle}
            styleDetail={data.styleDetail}
          />
        )}
        {data.primaryStyle && data.styleDetail && (
          <DetailResultSection
            primaryStyle={data.primaryStyle}
            styleDetail={data.styleDetail}
          />
        )}
        <DataStatusSection
          dataSummary={data.dataSummary}
          relativeStyles={data.relativeStyles}
          aiToolUsage={data.aiToolUsage}
        />
        {data.styleDetail && (
          <StrengthWeaknessSection
            detailStrengths={data.styleDetail.detailStrengths}
            detailCautions={data.styleDetail.detailCautions}
            tip={data.styleDetail.tip}
          />
        )}
        {data.dailyTimeline && (
          <TimelineSection
            sessionId={data.sessionId}
            dailyTimeline={data.dailyTimeline}
            relativeStyles={data.relativeStyles}
            aiToolUsage={data.aiToolUsage}
          />
        )}
      </main>
    </div>
  );
};

export default SessionResultDisplay;