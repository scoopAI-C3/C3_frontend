import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionResultDisplay from "../components/dashboard/SessionResultDisplay";
import { getSessionResult } from "../apis/session";
import type { SessionResultData } from "../types/session";

const Dashboard = () => {
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(null);
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

  if (!sessionResult) {
    return <div className="bg-[#211F26] w-screen h-screen" />; 
  }

  return <SessionResultDisplay data={sessionResult} isSharedView={false} />;
};

export default Dashboard;