import { useNavigate } from "react-router-dom";
import StyleResultSection from "./StyleResultSection";
import DetailResultSection from "./DetailResultSection";
import DataStatusSection from "./DataStatusSection";
import StrengthWeaknessSection from "./StrengthWeaknessSection";
import TimelineSection from "./TimelineSection";
import type { SessionResultData } from "../../types/session";
import { useLanguage } from "../../contexts/LanguageContext";

interface SessionResultDisplayProps {
  data: SessionResultData;
  isSharedView?: boolean;
  isFromSurvey?: boolean;
}

const SessionResultDisplay = ({ data, isFromSurvey = false }: SessionResultDisplayProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert(language === 'ko' ? '링크가 클립보드에 복사되었습니다!' : 'Link copied to clipboard!');
  };

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

        {/* 세션 결과인 경우 TimelineSection 표시 */}
        {!isFromSurvey && data.dailyTimeline && (
          <TimelineSection
            sessionId={data.sessionId}
            dailyTimeline={data.dailyTimeline}
            relativeStyles={data.relativeStyles}
            aiToolUsage={data.aiToolUsage}
          />
        )}

        {/* 설문조사 결과인 경우 공유/홈 버튼 표시 */}
        {isFromSurvey && (
          <section className="flex flex-col items-center w-screen py-16 px-17">
            <div className="flex flex-row justify-center gap-11 font-[Inter]">
              <button
                onClick={handleShare}
                className="w-80 h-28 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-3xl text-xl font-semibold leading-10 cursor-pointer hover:opacity-90 transition-opacity text-white"
              >
                {language === 'ko' ? '결과 공유하기' : 'Share result'}
              </button>
              <button
                onClick={() => navigate('/landing')}
                className="w-80 h-28 bg-white/30 rounded-3xl text-xl font-semibold leading-10 cursor-pointer hover:bg-white/40 transition-colors text-white"
              >
                {language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SessionResultDisplay;