import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import StyleResultSection from "../components/dashboard/StyleResultSection";
import DetailResultSection from "../components/dashboard/DetailResultSection";
import DataStatusSection from "../components/dashboard/DataStatusSection";
import StrengthWeaknessSection from "../components/dashboard/StrengthWeaknessSection";
import TimelineSection from "../components/dashboard/TimelineSection";
import { getSessionResult } from "../apis/session";
import type { SessionResultData, SurveyResultData } from "../types/session";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(
    null
  );
  const [surveyResult, setSurveyResult] = useState<SurveyResultData | null>(
    null
  );
  const [isFromSurvey, setIsFromSurvey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // 먼저 설문조사에서 온 경우인지 확인
        const storedSurveyResult = localStorage.getItem("surveyResult");
        if (storedSurveyResult) {
          const parsed = JSON.parse(storedSurveyResult);
          if (parsed.apiResult) {
            // 설문조사에서 온 경우 - survey-result API 결과 사용
            setSurveyResult(parsed.apiResult);
            setIsFromSurvey(true);
            // 사용 후 localStorage에서 제거 (다음 방문시 기존 로직 사용)
            localStorage.removeItem("surveyResult");
            setLoading(false);
            return;
          }
        }

        // 기존 로직 - 세션 기반 API 호출
        const data = (await chrome.storage.local.get([
          "sessionId",
        ])) as { sessionId?: string };
        if (data.sessionId) {
          const response = await getSessionResult(data.sessionId);
          if (response.isSuccess) {
            setSessionResult(response.result);
          }
        }
      } catch (error) {
        console.error("Failed to fetch result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  // 현재 사용할 데이터 결정
  const currentData = isFromSurvey ? surveyResult : sessionResult;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-start w-screen min-h-screen bg-[#211F26] overflow-y-auto">
      <main className="flex flex-col items-center font-[NanumSquareRound] text-white">
        {currentData?.primaryStyle && currentData?.styleDetail && (
          <StyleResultSection
            primaryStyle={currentData.primaryStyle}
            styleDetail={currentData.styleDetail}
          />
        )}
        {currentData?.primaryStyle && currentData?.styleDetail && (
          <DetailResultSection
            primaryStyle={currentData.primaryStyle}
            styleDetail={currentData.styleDetail}
          />
        )}
        {/* DataStatusSection - 기존 세션 결과에서만 표시 (설문조사 결과에는 relativeStyles, aiToolUsage가 없음) */}
        {!isFromSurvey && sessionResult && (
          <DataStatusSection
            dataSummary={sessionResult.dataSummary}
            relativeStyles={sessionResult.relativeStyles}
            aiToolUsage={sessionResult.aiToolUsage}
          />
        )}
        {/* 설문조사에서 온 경우 dataSummary만 표시 */}
        {isFromSurvey && surveyResult?.dataSummary && (
          <DataStatusSection
            dataSummary={surveyResult.dataSummary}
            relativeStyles={null}
            aiToolUsage={null}
          />
        )}
        {currentData?.styleDetail && (
          <StrengthWeaknessSection
            detailStrengths={currentData.styleDetail.detailStrengths}
            detailCautions={currentData.styleDetail.detailCautions}
            tip={currentData.styleDetail.tip}
          />
        )}
        {/* TimelineSection - 기존 세션 결과에서만 표시 */}
        {!isFromSurvey && sessionResult?.dailyTimeline && (
          <TimelineSection dailyTimeline={sessionResult.dailyTimeline} />
        )}

        {/* Report Button - 기존 세션 결과에서만 표시 */}
        {!isFromSurvey && (
          <div className="flex justify-center py-16">
            <button
              onClick={() => navigate('/report')}
              className="px-16 py-5 rounded-[28px] bg-gradient-to-r from-[#C930C7] to-[#A36EFF] text-white text-xl font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              상세 리포트 보기
            </button>
          </div>
        )}

        {/* 설문조사에서 온 경우 랜딩 페이지로 돌아가는 버튼 */}
        {isFromSurvey && (
          <div className="flex justify-center py-16">
            <button
              onClick={() => navigate('/landing')}
              className="px-16 py-5 rounded-[28px] bg-gradient-to-r from-[#C930C7] to-[#A36EFF] text-white text-xl font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              처음으로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
