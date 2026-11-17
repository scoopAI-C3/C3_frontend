import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";
import type { DailyTimeline, TimelineEvent } from "../../types/session";
import { createShareLink } from "../../apis/share";
import { useLanguage } from "../../contexts/LanguageContext";

interface TimelineSectionProps {
  sessionId: string;
  dailyTimeline: DailyTimeline;
  relativeStyles: Record<string, number>;
  aiToolUsage: Record<string, number>;
  /** 상세 분석으로 요청 유형이 기록된 질문 수 */
  detailPrompts?: number;
}

const TOOL_COLORS = ["#6C47B5", "#8F57FF", "#362F45"];

const TIMELINE_COLORS = [
  "#A3E635",
  "#22D3EE",
  "#38BDF8",
  "#818CF8",
  "#C084FC",
  "#F472B6",
  "#FB923C",
  "#FACC15",
];

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

interface TimelineChartProps {
  events: TimelineEvent[];
}

const TimelineChart = ({ events }: TimelineChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (events.length === 0) return null;

  const allTimes = events.map((e) => timeToMinutes(e.start));
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const timeRange = maxTime - minTime;

  const useEvenSpacing = timeRange < 20 || events.length > 6;

  const MIN_GAP_PERCENT = 10;

  const calculatePosition = (idx: number): number => {
    if (events.length === 1) return 50;

    if (useEvenSpacing) {
      return 5 + (idx / (events.length - 1)) * 90;
    }

    const position = timeRange > 0
      ? ((allTimes[idx] - minTime) / timeRange) * 90 + 5
      : 50;

    return position;
  };

  const adjustedPositions = events.map((_, idx) => calculatePosition(idx));

  for (let i = 1; i < adjustedPositions.length; i++) {
    const gap = adjustedPositions[i] - adjustedPositions[i - 1];
    if (gap < MIN_GAP_PERCENT) {
      adjustedPositions[i] = adjustedPositions[i - 1] + MIN_GAP_PERCENT;
    }
  }

  const maxPos = Math.max(...adjustedPositions);
  if (maxPos > 95) {
    const scale = 90 / (maxPos - 5);
    for (let i = 0; i < adjustedPositions.length; i++) {
      adjustedPositions[i] = 5 + (adjustedPositions[i] - 5) * scale;
    }
  }

  return (
    <div className="relative w-full py-16 px-8">
      <div className="absolute left-8 right-8 top-1/2 h-1 bg-gradient-to-r from-[#A3E635] via-[#38BDF8] to-[#C084FC] rounded-full" />

      <div className="relative flex justify-between items-center" style={{ height: "200px" }}>
        {events.map((event, idx) => {
          const position = adjustedPositions[idx];
          const isTop = idx % 2 === 0;
          const color = TIMELINE_COLORS[idx % TIMELINE_COLORS.length];

          return (
            <div
              key={idx}
              className="absolute flex flex-col items-center"
              style={{
                left: `${position}%`,
                transform: "translateX(-50%)",
              }}
            >
              {isTop && (
                <div className="flex flex-col items-center mb-2" style={{ marginTop: "-60px" }}>
                  <span className="text-xs font-medium" style={{ color }}>
                    {event.start}
                  </span>
                  <span className="mb-1 max-w-[140px] text-center text-[11px] leading-tight text-white/70">{event.label}</span>
                  <div className="w-0.5 h-8" style={{ backgroundColor: color }} />
                </div>
              )}

              <div
                className="relative z-10 cursor-pointer transition-transform duration-200 hover:scale-125"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="w-5 h-5 rounded-full border-4 border-[#211F26]"
                  style={{ backgroundColor: color }}
                />

                {hoveredIndex === idx && (
                  <div
                    className={`absolute z-50 px-4 py-3 rounded-lg shadow-xl whitespace-nowrap ${
                      isTop ? "top-8" : "bottom-8"
                    }`}
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(33, 31, 38, 0.95)",
                      border: `1px solid ${color}`,
                      minWidth: "200px",
                    }}
                  >
                    <div className="text-xs font-mono mb-1" style={{ color }}>
                      {event.start} - {event.end}
                    </div>
                    <div className="text-sm text-white/90">{event.label}</div>
                    {event.summary && <div className="mt-1 text-xs text-white/55">{event.summary}</div>}
                  </div>
                )}
              </div>

              {!isTop && (
                <div className="flex flex-col items-center mt-2" style={{ marginBottom: "-60px" }}>
                  <div className="w-0.5 h-8" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium mt-1" style={{ color }}>
                    {event.start}
                  </span>
                  <span className="max-w-[140px] text-center text-[11px] leading-tight text-white/70">{event.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const STYLE_SHORT: Record<string, Record<string, string>> = {
  ko: { 'AI-Driven Executor': '실행형', 'AI-Assisted Thinker': '사고형', 'AI Checker': '검증형', 'Balanced Collaborator': '균형형' },
  en: { 'AI-Driven Executor': 'executor', 'AI-Assisted Thinker': 'thinker', 'AI Checker': 'checker', 'Balanced Collaborator': 'balanced' },
};

const TOOL_NAMES: Record<string, string> = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot' };

/** 결과 ID가 'day-YYYY-MM-DD'면 그날 기준 제목, 오늘이면 "오늘의 흐름" */
const flowTitle = (resultId: string, language: string): string => {
  const match = /^day-(\d{4})-(\d{2})-(\d{2})$/.exec(resultId);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (!match || `${match[1]}-${match[2]}-${match[3]}` === today) return language === 'ko' ? '오늘의 흐름' : "Today's flow";
  const month = Number(match[2]);
  const day = Number(match[3]);
  return language === 'ko' ? `${month}월 ${day}일의 흐름` : `Flow on ${month}/${day}`;
};

const BAR_COLOR = "#643E83";      
const BAR_BG_COLOR = "#211F26";    

const TimelineSection = ({ sessionId, dailyTimeline, relativeStyles, aiToolUsage, detailPrompts = 0 }: TimelineSectionProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
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
          <div className="flex flex-col bg-white/5 font-[Inter] px-7 py-6 w-full rounded-lg">
            <div className="flex flex-row items-center w-full">
              <h2 className="text-2xl font-semibold mr-5 text-white">{flowTitle(sessionId, language)}</h2>
              <p className="text-white/60 text-sm font-normal leading-5">
                {language === 'ko'
                  ? `AI와 주고받은 구간 ${dailyTimeline.decisionCount}개`
                  : `${dailyTimeline.decisionCount} segments with AI`}
              </p>
            </div>
            <p className="mt-2 text-white/45 text-xs leading-relaxed">
              {detailPrompts > 0
                ? (language === 'ko'
                  ? `질문을 주고받은 구간마다 어떤 흐름이었는지 보여 줍니다. 상세 분석을 켠 동안 보낸 질문 ${detailPrompts}개는 요청 유형까지 함께 표시됩니다.`
                  : `Shows what each back-and-forth with AI looked like. The ${detailPrompts} prompts sent with detailed analysis on also show their request type.`)
                : (language === 'ko'
                  ? '질문을 주고받은 구간마다 어떤 흐름이었는지 보여 줍니다. 무엇을 물었는지는 보지 않고 시간 흐름으로만 판단합니다. 상세 분석을 켜면 요청 유형도 함께 표시됩니다.'
                  : 'Shows what each back-and-forth with AI looked like, judged from timing only, not content. Turn on detailed analysis to also see request types.')}
            </p>
            {dailyTimeline.events.length > 0 && (
              <>
                <TimelineChart events={dailyTimeline.events} />
                <ul className="mt-2 grid gap-2">
                  {dailyTimeline.events.map((event, idx) => (
                    <li key={idx} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-black/20 px-4 py-2.5">
                      <span className="w-12 shrink-0 text-sm font-semibold" style={{ color: TIMELINE_COLORS[idx % TIMELINE_COLORS.length] }}>{event.start}</span>
                      <span className="text-sm text-white">{event.label}</span>
                      {event.summary && <span className="text-xs text-white/50">{event.summary}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex flex-row w-full mt-6 gap-4">
            <div className="flex flex-col bg-white/5 font-[Inter] px-7 py-6 w-full rounded-lg">
              <h2 className="text-2xl font-semibold text-white">{language === 'ko' ? '스타일별 점수' : 'Score by style'}</h2>
              <p className="mt-1 mb-5 text-white/45 text-xs leading-relaxed">
                {language === 'ko'
                  ? '내 행동이 네 가지 스타일과 각각 얼마나 닮았는지입니다. 합하면 100%이고, 가장 높은 것이 내 스타일입니다.'
                  : 'How closely your behavior matches each of the four styles. They add up to 100%; the highest is your style.'}
              </p>
              <div className="flex flex-col gap-3">
                {Object.entries(relativeStyles)
                  .sort(([, a], [, b]) => b - a)
                  .map(([style, value], rank) => (
                    <div key={style} className="flex items-center gap-4">
                      <span className={`text-sm w-44 shrink-0 ${rank === 0 ? 'text-white font-semibold' : 'text-white/70'}`}>
                        {style}
                        <span className="ml-1.5 text-xs text-white/40">{STYLE_SHORT[language][style] ?? ''}</span>
                      </span>
                      
                      <div 
                        className="flex-1 h-8 overflow-hidden rounded-sm"
                        style={{ backgroundColor: BAR_BG_COLOR }} 
                      >
                        <div
                          className="h-full transition-all duration-500 rounded-sm"
                          style={{
                            width: `${value * 100}%`,
                            backgroundColor: rank === 0 ? '#A36EFF' : BAR_COLOR,
                          }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-sm text-white/70">{Math.round(value * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col bg-white/5 font-[Inter] px-7 py-6 w-full rounded-lg">
              <h2 className="text-2xl font-semibold text-white">{language === 'ko' ? 'AI 도구별 사용 비율' : 'Usage by AI tool'}</h2>
              <p className="mt-1 mb-4 text-white/45 text-xs leading-relaxed">
                {language === 'ko' ? '기록된 질문과 답변이 어느 사이트에서 나왔는지입니다.' : 'Which site your recorded prompts and answers came from.'}
              </p>
              <div className="flex flex-row items-center justify-between h-full pl-2 pr-4">
                <div className="flex flex-col gap-4">
                  {toolEntries.map(([tool, value], index) => (
                    <div key={tool} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: TOOL_COLORS[index % TOOL_COLORS.length] }}
                      />
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">{TOOL_NAMES[tool] ?? tool}</span>
                        <span className="text-white/50 text-xs">{Math.round(value * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="w-40 h-40 rounded-full relative shrink-0" 
                  style={{ 
                    background: generatePieGradient(),
                    maskImage: "radial-gradient(transparent 55%, black 56%)",
                    WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)"
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-row w-full mt-10 justify-center gap-11 px-4 font-[Inter]">
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="w-80 h-28 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-3xl text-xl font-semibold leading-10 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
            >
              {isSharing ? (language === 'ko' ? '링크 만드는 중…' : 'Creating link…') : (language === 'ko' ? '결과 공유하기' : 'Share result')}
            </button>
            <button
              onClick={() => {
                // sessionId를 localStorage에 저장하여 ReportPage에서 사용
                if (sessionId) {
                  localStorage.setItem("sharedSessionId", sessionId);
                }
                navigate('/report');
              }}
              className="w-80 h-28 bg-white/30 rounded-3xl text-xl font-semibold leading-10 cursor-pointer hover:bg-white/40 transition-colors text-white"
            >
              {language === 'ko' ? '분석 리포트 보기' : 'View Analysis Report'}
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TimelineSection;