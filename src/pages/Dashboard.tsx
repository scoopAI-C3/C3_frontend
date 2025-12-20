import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionResultDisplay from "../components/dashboard/SessionResultDisplay";
import { getSessionResult } from "../apis/session";
import type { SessionResultData, SurveyResultData } from "../types/session";

const Dashboard = () => {
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(null);
  const [surveyResult, setSurveyResult] = useState<SurveyResultData | null>(null);
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

        // 먼저 localStorage에서 sharedSessionId 확인 (공유 페이지에서 온 경우)
        const sharedSessionId = localStorage.getItem("sharedSessionId");
        if (sharedSessionId) {
          const response = await getSessionResult(sharedSessionId);
          if (response.isSuccess) {
            setSessionResult(response.result);
          }
          setLoading(false);
          return;
        }

        // 웹 환경인지 확인
        if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
          console.log("Web environment detected: Skipping chrome.storage access.");
          setLoading(false);
          return;
        }

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

  if (loading) {
    return <LoadingSpinner />;
  }

  // 설문조사 결과인 경우
  if (isFromSurvey && surveyResult) {
    // SurveyResultData를 SessionResultData 형식으로 변환
    const convertedData: SessionResultData = {
      sessionId: "",
      primaryStyle: surveyResult.primaryStyle,
      styleDetail: surveyResult.styleDetail,
      dataSummary: surveyResult.dataSummary,
      strengths: surveyResult.strengths,
      cautions: surveyResult.cautions,
      roleDistribution: null,
      relativeStyles: null as unknown as SessionResultData["relativeStyles"],
      aiToolUsage: null as unknown as SessionResultData["aiToolUsage"],
      dailyTimeline: null as unknown as SessionResultData["dailyTimeline"],
    };
    return <SessionResultDisplay data={convertedData} isSharedView={false} />;
  }

  // 세션 결과인 경우
  if (!sessionResult) {
    return <div className="bg-[#211F26] w-screen h-screen" />;
  }

  return <SessionResultDisplay data={sessionResult} isSharedView={false} />;
};

export default Dashboard;
