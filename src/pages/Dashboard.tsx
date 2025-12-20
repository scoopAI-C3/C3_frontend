import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StyleResultSection from "../components/dashboard/StyleResultSection";
import DetailResultSection from "../components/dashboard/DetailResultSection";
import DataStatusSection from "../components/dashboard/DataStatusSection";
import StrengthWeaknessSection from "../components/dashboard/StrengthWeaknessSection";
import TimelineSection from "../components/dashboard/TimelineSection";
import { getSessionResult } from "../apis/session";
import type { SessionResultData } from "../types/session";

const Dashboard = () => {
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionResult = async () => {
      try {
        const data = await chrome.storage.local.get(["sessionId"]) as { sessionId?: string };
        if (data.sessionId) {
          const response = await getSessionResult(data.sessionId);
          if (response.isSuccess) {
            setSessionResult(response.result);
          }
        }
      } catch (error) {
        console.error("Failed to fetch session result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionResult();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-start w-screen min-h-screen bg-[#211F26] overflow-y-auto">
      <main className="flex flex-col items-center font-[NanumSquareRound] text-white">
        {sessionResult?.primaryStyle && sessionResult?.styleDetail && (
          <StyleResultSection
            primaryStyle={sessionResult.primaryStyle}
            styleDetail={sessionResult.styleDetail}
          />
        )}
        {sessionResult?.primaryStyle && sessionResult?.styleDetail && (
          <DetailResultSection
            primaryStyle={sessionResult.primaryStyle}
            styleDetail={sessionResult.styleDetail}
          />
        )}
        {sessionResult && (
          <DataStatusSection
            dataSummary={sessionResult.dataSummary}
            relativeStyles={sessionResult.relativeStyles}
            aiToolUsage={sessionResult.aiToolUsage}
          />
        )}
        {sessionResult?.styleDetail && (
          <StrengthWeaknessSection
            detailStrengths={sessionResult.styleDetail.detailStrengths}
            detailCautions={sessionResult.styleDetail.detailCautions}
            tip={sessionResult.styleDetail.tip}
          />
        )}
        {sessionResult?.dailyTimeline && (
          <TimelineSection dailyTimeline={sessionResult.dailyTimeline} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
