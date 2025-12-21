import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionResultDisplay from "../components/dashboard/SessionResultDisplay";
import { getSharedSessionResult } from "../apis/share";
import type { SessionResultData } from "../types/session";
import { useLanguage } from "../contexts/LanguageContext";

const SharedPage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { language } = useLanguage();
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSharedResult = async () => {
      if (!shareToken) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await getSharedSessionResult(shareToken, language);

        if (response.isSuccess && response.result) {
          setSessionResult(response.result.result);
          // 공유 페이지에서도 sessionId를 localStorage에 저장하여 ReportPage, Dashboard에서 사용
          if (response.result.result.sessionId) {
            localStorage.setItem("sharedSessionId", response.result.result.sessionId);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch shared result:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedResult();
  }, [shareToken, language]);

  if (loading) return <LoadingSpinner />;

  if (error || !sessionResult) {
    return (
      <div className="flex w-screen h-screen items-center justify-center bg-[#211F26] text-white">
        <p>{language === 'ko' ? '유효하지 않거나 만료된 공유 링크입니다.' : 'Invalid or expired share link.'}</p>
      </div>
    );
  }

  return <SessionResultDisplay data={sessionResult} isSharedView={true} />;
};

export default SharedPage;  