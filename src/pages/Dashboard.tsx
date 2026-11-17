import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionResultDisplay from "../components/dashboard/SessionResultDisplay";
import { analyzeSession, getSessionResult } from "../apis/session";
import EmptyResult from "../components/dashboard/EmptyResult";
import type { SessionResultData, SurveyResultData } from "../types/session";
import { useLanguage } from "../contexts/LanguageContext";

const Dashboard = () => {
  const { language } = useLanguage();
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(null);
  const [surveyResult, setSurveyResult] = useState<SurveyResultData | null>(null);
  const [isFromSurvey, setIsFromSurvey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

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

        const isExtension = typeof chrome !== "undefined" && !!chrome.storage?.local;

        // 웹(공유 링크로 들어온 경우): 공유받은 결과를 보여 준다
        if (!isExtension) {
          const sharedSessionId = localStorage.getItem("sharedSessionId");
          if (sharedSessionId) {
            const response = await getSessionResult(sharedSessionId, language);
            if (response.isSuccess) setSessionResult(response.result);
          }
          setLoading(false);
          return;
        }

        // 확장 프로그램: 열 때마다 지금까지의 기록으로 다시 분석해서 바로 보여 준다
        const data = (await chrome.storage.local.get(["sessionId"])) as { sessionId?: string };
        if (!data.sessionId) {
          setEmpty(true);
          return;
        }
        await analyzeSession({ sessionId: data.sessionId, language });
        const response = await getSessionResult(data.sessionId, language);
        if (response.isSuccess && (response.result.totalPrompts ?? 0) > 0) {
          setSessionResult(response.result);
        } else {
          setEmpty(true);
        }
      } catch (error) {
        console.error("Failed to fetch result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [language]);

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
    return <SessionResultDisplay data={convertedData} isSharedView={false} isFromSurvey={true} />;
  }

  // 세션 결과인 경우
  if (!sessionResult || empty) {
    return <EmptyResult />;
  }

  return <SessionResultDisplay data={sessionResult} isSharedView={false} />;
};

export default Dashboard;
