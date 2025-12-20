import { useState } from "react";
import ScrollReveal from "../ScrollReveal";
import type { DailyTimeline } from "../../types/session";
import { createShareLink } from "../../apis/share";

interface TimelineSectionProps {
  sessionId: string;
  dailyTimeline: DailyTimeline;
  relativeStyles: Record<string, number>;
  aiToolUsage: Record<string, number>;
}

const TOOL_COLORS = ["#6C47B5", "#8F57FF", "#362F45"];

const BAR_COLOR = "#643E83";      
const BAR_BG_COLOR = "#211F26";    

const TimelineSection = ({ sessionId, dailyTimeline, relativeStyles, aiToolUsage }: TimelineSectionProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const toolEntries = Object.entries(aiToolUsage);
  const generatePieGradient = () => {
    let gradient = "";
    let currentAngle = 0;

    toolEntries.forEach(([, value], index) => {
      const angle = value * 360;
      const color = TOOL_COLORS[index % TOOL_COLORS.length];
      gradient += `${color} ${currentAngle}deg ${currentAngle + angle}deg, `;
      currentAngle += angle;
    });

    return `conic-gradient(${gradient.slice(0, -2)})`;
  };

  // 공유 버튼 핸들러
  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);
      
      const response = await createShareLink({
        sessionId: sessionId,
        expiresInHours: 24
      });

      if (response.isSuccess && response.result) {
        const shareUrl = response.result.shareUrl;
        await navigator.clipboard.writeText(shareUrl);
        alert(`공유 링크가 클립보드에 복사되었습니다!\n${shareUrl}`);
      } else {
        alert("공유 링크 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Share failed:", error);
      alert("공유 중 오류가 발생했습니다.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <section className="flex flex-col items-center w-screen min-h-screen py-10 px-17">
      <div className="flex flex-col items-start w-full">
        <ScrollReveal animation="fadeUp" delay={0} className="w-full">
          <div className="flex bg-white/5 font-[Inter] px-7 py-6 w-full rounded-lg">
            <div className="flex flex-row items-center w-full h-full">
              <h2 className="text-2xl font-normal mr-5 text-white">Daily TimeLine</h2>
              <p className="text-white/50 text-xs font-normal leading-5">
                오늘 당신은 하루동안 총 {dailyTimeline.decisionCount}번의 결정을
                AI에 위임했습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-row w-full mt-6 gap-4">
            <div className="flex flex-col bg-white/5 font-[Inter] px-7 py-6 w-full rounded-lg">
              <h2 className="text-2xl font-normal mb-6 text-white">Relative Other Styles</h2>
              <div className="flex flex-col gap-3">
                {Object.entries(relativeStyles)
                  .filter(([, value]) => value > 0)
                  .map(([style, value]) => (
                    <div key={style} className="flex items-center gap-4">
                      <span className="text-white/70 text-sm w-40 shrink-0">{style}</span>
                      
                      <div 
                        className="flex-1 h-8 overflow-hidden rounded-sm"
                        style={{ backgroundColor: BAR_BG_COLOR }} 
                      >
                        <div
                          className="h-full transition-all duration-500 rounded-sm"
                          style={{
                            width: `${value * 100}%`,
                            backgroundColor: BAR_COLOR, 
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col bg-white/5 font-[Inter] px-7 py-6 w-full rounded-lg">
              <h2 className="text-2xl font-normal mb-6 text-white">AI Tool Usage</h2>
              <div className="flex items-center justify-center gap-6">
                <div
                  className="w-24 h-24 rounded-full relative"
                  style={{ 
                    background: generatePieGradient(),
                    maskImage: "radial-gradient(transparent 55%, black 56%)",
                    WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)"
                  }}
                />
                
                <div className="flex flex-col gap-2">
                  {toolEntries.map(([tool, value], index) => (
                    <div key={tool} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TOOL_COLORS[index % TOOL_COLORS.length] }}
                      />
                      <span className="text-white/70">{tool}</span>
                      <span className="text-white/50">{Math.round(value * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row w-full mt-10 justify-center gap-11 px-4 font-[Inter]">
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="w-80 h-28 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-3xl text-xl font-semibold leading-10 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
            >
              {isSharing ? "Creating Link..." : "Share"}
            </button>
            <button className="w-80 h-28 bg-white/30 rounded-3xl text-xl font-semibold leading-10 cursor-pointer hover:bg-white/40 transition-colors text-white">
              분석 리포트 보기
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TimelineSection;