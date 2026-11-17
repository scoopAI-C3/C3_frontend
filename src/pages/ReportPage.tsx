import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { getSessionGraph } from "../apis/session";
import type { SessionGraphData } from "../types/session";
import reportBg from "../assets/reportBg.webp";
import { INTENT_LABELS } from "../local/intent";
import { useLanguage } from "../contexts/LanguageContext";

const nodeNameMapKo: Record<string, string> = {
  extract_metrics: "지표 추출",
  analyze_patterns: "패턴 분석",
  behavior_scoring: "행동 점수화",
  llm_analysis: "AI 분석",
  determine_style: "스타일 결정",
  generate_report: "리포트 생성",
};

const nodeNameMapEn: Record<string, string> = {
  extract_metrics: "Extract Metrics",
  analyze_patterns: "Analyze Patterns",
  behavior_scoring: "Behavior Scoring",
  llm_analysis: "AI Analysis",
  determine_style: "Determine Style",
  generate_report: "Generate Report",
};

const levelNameMapKo: Record<string, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
  short: "낮음",
  long: "높음",
};

const levelNameMapEn: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  short: "Low",
  long: "High",
};

const getLevelTagStyle = (level: string): React.CSSProperties => {
  switch (level) {
    case "high":
    case "long":
      return {
        background: 'rgba(232,34,229,0.4)',
        color: '#FF7DFD',
        border: '1px solid rgba(232,34,229,0.6)',
      };
    case "medium":
      return {
        background: 'rgba(186,128,255,0.3)',
        color: '#BA80FF',
        border: '1px solid rgba(186,128,255,0.5)',
      };
    case "low":
    case "short":
    default:
      return {
        background: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.6)',
      };
  }
};

const ReportPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [graphData, setGraphData] = useState<SessionGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");

  const nodeNameMap = language === 'ko' ? nodeNameMapKo : nodeNameMapEn;
  const levelNameMap = language === 'ko' ? levelNameMapKo : levelNameMapEn;

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        let currentSessionId: string | undefined;

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          // 확장 프로그램: 항상 지금 세션 (공유 링크용 값이 남아 있어도 쓰지 않는다)
          const data = await chrome.storage.local.get(["sessionId"]) as { sessionId?: string };
          currentSessionId = data.sessionId;
        } else {
          // 웹: 공유 링크로 받은 결과
          currentSessionId = localStorage.getItem("sharedSessionId") ?? undefined;
        }

        if (currentSessionId) {
          setSessionId(currentSessionId);
          const response = await getSessionGraph(currentSessionId, language);
          if (response.isSuccess) {
            setGraphData(response.result);
          }
        }
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const executionNodes = graphData?.graphExecution.nodesExecuted || [];
  const executionRow1 = executionNodes.slice(0, 4);
  const executionRow2 = executionNodes.slice(4);

  const eventDistribution = graphData?.metrics.eventTypeDistribution || {};
  const maxEventCount = Math.max(...Object.values(eventDistribution), 1);

  return (
    <div className="w-screen min-h-screen bg-[#211F26] overflow-y-auto">
      <main className="w-full py-8">
        <div className="max-w-[1100px] mx-auto px-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="px-3 py-1 rounded-md text-white text-xs font-medium"
                  style={{ background: 'linear-gradient(90deg, #E822E5 0%, #7C3BEC 100%)' }}
                >
                  {language === 'ko' ? '분석완료' : 'Complete'}
                </div>
                <span className="text-white/40 text-xs">
                  {language === 'ko' ? '세션 ID' : 'Session ID'} : {graphData?.sessionId || sessionId || "session ID - 12255ed7"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {language === 'ko' ? 'AI 협업 패턴 분석 리포트' : 'AI Collaboration Pattern Analysis Report'}
              </h1>
            </div>

            <div className="flex gap-6 text-right">
              <div>
                <div className="text-white/60 text-xs">{language === 'ko' ? '분석 소요 시간' : 'Analysis Time'}</div>
                <div className="text-white text-lg font-medium">
                  {graphData?.graphExecution.executionTime.toFixed(1) || "0.1"} {language === 'ko' ? '초' : 'sec'}
                </div>
              </div>
              <div>
                <div className="text-[#BA80FF] text-xs">{language === 'ko' ? '수행 유닛' : 'Units'}</div>
                <div className="text-[#BA80FF] text-lg font-medium">
                  {graphData?.graphExecution.nodesExecuted.length || 6} {language === 'ko' ? '단계' : 'steps'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-10">
            <div
              className="flex-1 rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">{language === 'ko' ? '프롬프트 적극성' : 'Prompt Activeness'}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={getLevelTagStyle(graphData?.patterns.prompt.level || "low")}
                >
                  {levelNameMap[graphData?.patterns.prompt.level || "low"] || (language === 'ko' ? "낮음" : "Low")}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-light">
                  {Math.round((graphData?.patterns.prompt.score || 0.2) * 100)}
                </span>
                <span className="text-white/40 text-lg">{language === 'ko' ? '점' : 'pts'}</span>
              </div>
              <span className="text-white/70 text-sm">
                {graphData?.patterns.prompt.description || (language === 'ko' ? "선택적 AI 활용" : "Selective AI Usage")}
              </span>
            </div>

            <div
              className="flex-1 rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">{language === 'ko' ? '상호작용 간격' : 'Interaction Interval'}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={getLevelTagStyle(graphData?.patterns.interval.level || "medium")}
                >
                  {levelNameMap[graphData?.patterns.interval.level || "medium"] || (language === 'ko' ? "보통" : "Medium")}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-light">
                  {Math.round((graphData?.patterns.interval.score || 0.5) * 100)}
                </span>
                <span className="text-white/40 text-lg">{language === 'ko' ? '점' : 'pts'}</span>
              </div>
              <span className="text-white/70 text-sm">
                {graphData?.patterns.interval.description || (language === 'ko' ? "적당한 사고 시간" : "Adequate thinking time")}
              </span>
            </div>

            <div
              className="flex-1 rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">{language === 'ko' ? '결과 정교화' : 'Result Refinement'}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={getLevelTagStyle(graphData?.patterns.refinement.level || "low")}
                >
                  {levelNameMap[graphData?.patterns.refinement.level || "low"] || (language === 'ko' ? "낮음" : "Low")}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-light">
                  {Math.round((graphData?.patterns.refinement.score || 0.3) * 100)}
                </span>
                <span className="text-white/40 text-lg">{language === 'ko' ? '점' : 'pts'}</span>
              </div>
              <span className="text-white/70 text-sm">
                {graphData?.patterns.refinement.description || (language === 'ko' ? "적당한 수정 과정" : "Adequate refinement")}
              </span>
            </div>
          </div>
        </div>

        <div
          className="w-full py-10"
          style={{
            backgroundImage: `url(${reportBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
          }}
        >
          <div className="max-w-[1100px] mx-auto px-10">
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                background: 'linear-gradient(180deg, rgba(60,30,80,0.6) 0%, rgba(35,20,50,0.8) 100%)',
                border: '1px solid rgba(186,128,255,0.3)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(186,128,255,0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" stroke="#BA80FF" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
                <h2 className="text-white text-xl font-semibold">{language === 'ko' ? '선택적 AI 활용' : 'Selective AI Usage'}</h2>
              </div>

              <div className="flex gap-8">
                <div className="flex-1">
                  <h3 className="text-white/60 text-sm mb-4">{language === 'ko' ? 'LLM 상세 분석' : 'LLM Detailed Analysis'}</h3>
                  <div className="space-y-3">
                    {(graphData?.llmInsights || [
                      "균형 잡힌 AI 협업 패턴을 보이고 있습니다.",
                      "필요한 시점에만 AI를 활용하여 주관적인 판단을 유지하고 있습니다.",
                      "정보 탐색과 검증에 적절한 시간을 투자하는 패턴입니다.",
                    ]).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-[#BA80FF] mt-0.5">✓</span>
                        <p className="text-white/70 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-white/60 text-sm mb-4">{language === 'ko' ? '핵심 행동 패턴' : 'Core Behavior Patterns'}</h3>
                  <div className="space-y-3">
                    {(graphData?.patternInsights || [
                      "균형 잡힌 AI 협업 패턴을 보이고 있습니다.",
                      "필요한 시점에만 AI를 활용하여 주관적인 판단을 유지하고 있습니다.",
                    ]).map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg p-3"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <p className="text-white/70 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(45,40,50,0.9)', border: '1px solid rgba(186,128,255,0.25)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white text-xl font-semibold">{language === 'ko' ? '요청 유형' : 'Request Types'}</h2>
                <span className="text-xs text-[#D9C2FF] rounded-md px-2 py-1" style={{ background: 'rgba(163,110,255,0.2)' }}>
                  {language === 'ko' ? '상세 분석' : 'Detailed analysis'}
                </span>
              </div>
              {graphData?.detail && graphData.detail.prompts > 0 ? (
                <>
                  <div className="space-y-3">
                    {(['execute', 'opinion', 'verify', 'revise', 'info', 'other'] as const).map((intent) => {
                      const count = graphData.detail?.intents[intent] ?? 0;
                      const ratio = count / (graphData.detail?.prompts || 1);
                      return (
                        <div key={intent}>
                          <div className="flex justify-between mb-1.5 text-sm">
                            <span className="text-white/75">{INTENT_LABELS[language][intent]}</span>
                            <span className="text-white">{count}{language === 'ko' ? '건' : ''} · {Math.round(ratio * 100)}%</span>
                          </div>
                          <div className="h-[7px] rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: 'linear-gradient(90deg, #E822E5 0%, #7C3BEC 100%)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                    <div className="rounded-xl py-3" style={{ background: 'rgba(50,45,55,0.8)' }}>
                      <p className="text-white text-lg font-semibold">{graphData.detail.prompts}</p>
                      <p className="text-white/50 text-xs mt-1">{language === 'ko' ? '분석한 질문' : 'Prompts analyzed'}</p>
                    </div>
                    <div className="rounded-xl py-3" style={{ background: 'rgba(50,45,55,0.8)' }}>
                      <p className="text-white text-lg font-semibold">{Math.round(graphData.detail.avgPromptLength)}{language === 'ko' ? '자' : ''}</p>
                      <p className="text-white/50 text-xs mt-1">{language === 'ko' ? '평균 질문 길이' : 'Avg. prompt length'}</p>
                    </div>
                    <div className="rounded-xl py-3" style={{ background: 'rgba(50,45,55,0.8)' }}>
                      <p className="text-white text-lg font-semibold">{graphData.detail.skimmedAnswers}/{graphData.detail.longAnswers}</p>
                      <p className="text-white/50 text-xs mt-1">{language === 'ko' ? '5초 안에 넘긴 긴 답변' : 'Long answers skipped <5s'}</p>
                    </div>
                  </div>
                  <p className="text-white/35 text-xs mt-4">
                    {language === 'ko'
                      ? '질문 텍스트는 분류한 뒤 버리고, 유형과 글자 수만 남깁니다.'
                      : 'Prompt text is discarded after classification; only the type and length are kept.'}
                  </p>
                </>
              ) : (
                <p className="text-white/50 text-sm leading-relaxed">
                  {language === 'ko'
                    ? '팝업에서 상세 분석을 켜면 질문이 실행·의견·검증·수정·정보 중 어떤 요청이었는지까지 분석해 결과가 더 정확해집니다.'
                    : 'Turn on detailed analysis in the popup to see whether each prompt was a do / opinion / check / revise / info request, for a more precise result.'}
                </p>
              )}
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                background: 'linear-gradient(90deg, #982E97 0%, #391C69 100%)',
                border: '1px solid rgba(186,128,255,0.4)',
              }}
            >
              <h2 className="text-white text-xl font-semibold mb-6">{language === 'ko' ? '그래프 실행 트레이스 (Execution Flow)' : 'Graph Execution Trace (Execution Flow)'}</h2>

              <div className="flex items-center mb-3 w-[85%]">
                {executionRow1.map((node, index) => (
                  <div key={node} className="flex items-center flex-1">
                    <div className="flex-1 py-3 rounded-lg text-white/80 text-sm text-center" style={{ background: 'rgba(186,128,255,0.3)' }}>
                      {nodeNameMap[node] || node}
                    </div>
                    {(index < executionRow1.length - 1 || executionRow2.length > 0) && (
                      <span className="text-[#BA80FF] mx-3">→</span>
                    )}
                  </div>
                ))}
              </div>

              {executionRow2.length > 0 && (
                <div className="flex items-center w-[42%]">
                  {executionRow2.map((node, index) => (
                    <div key={node} className="flex items-center flex-1">
                      <div className="flex-1 py-3 rounded-lg text-white/80 text-sm text-center" style={{ background: 'rgba(186,128,255,0.3)' }}>
                        {nodeNameMap[node] || node}
                      </div>
                      {index < executionRow2.length - 1 && (
                        <span className="text-[#BA80FF] mx-3">→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: 'rgba(45,40,50,0.9)' }}
            >
              <h2 className="text-white text-xl font-semibold mb-4">{language === 'ko' ? '수집 지표 데이터' : 'Collected Metrics Data'}</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">✦</span>
                    <span className="text-white/80">{language === 'ko' ? '총 프롬프트 수' : 'Total Prompts'}</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.totalPrompts || 0}{language === 'ko' ? '회' : ''}</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">⏱</span>
                    <span className="text-white/80">{language === 'ko' ? '평균 시간 간격' : 'Avg. Time Interval'}</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.avgInterval?.toFixed(1) || 0}{language === 'ko' ? '초' : 's'}</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">✎</span>
                    <span className="text-white/80">{language === 'ko' ? '수정 루프 횟수' : 'Refinement Loops'}</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.refinementLoops || 0}{language === 'ko' ? '회' : ''}</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">★</span>
                    <span className="text-white/80">{language === 'ko' ? '총 이벤트 발생' : 'Total Events'}</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.eventCount || 0}{language === 'ko' ? '회' : ''}</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">✓</span>
                    <span className="text-white/80">{language === 'ko' ? '의사결정 분기점' : 'Decision Boundaries'}</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.decisionBoundaries || 0}{language === 'ko' ? '회' : ''}</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 mb-8"
              style={{
                background: 'linear-gradient(180deg, rgba(60,30,80,0.6) 0%, rgba(35,20,50,0.8) 100%)',
                border: '1px solid rgba(186,128,255,0.3)',
              }}
            >
              <h2 className="text-white text-xl font-semibold mb-6">{language === 'ko' ? '이벤트 유형별 분포' : 'Event Type Distribution'}</h2>

              {Object.keys(eventDistribution).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-white/30 text-4xl mb-3">📊</span>
                  <p className="text-white/50 text-sm">{language === 'ko' ? '아직 수집된 이벤트 데이터가 없습니다.' : 'No event data collected yet.'}</p>
                  <p className="text-white/30 text-xs mt-1">{language === 'ko' ? 'AI 사이트에서 활동 후 다시 확인해주세요.' : 'Please check again after working on AI sites.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(eventDistribution).map(([eventType, count]) => (
                    <div key={eventType}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/70 text-sm">{eventType.replace(/_/g, ' ')}</span>
                        <span className="text-white text-sm">{count}{language === 'ko' ? '건' : ''}</span>
                      </div>
                      <div className="h-[7px] rounded-full overflow-hidden" style={{ background: 'transparent' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(count / maxEventCount) * 100}%`,
                            background: 'linear-gradient(90deg, #E822E5 0%, #7C3BEC 100%)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center pb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-8 py-3 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors cursor-pointer bg-gradient-to-r from-[#FF7DFD] to-[#A36EFF] font-medium text-lg"
              >
                {language === 'ko' ? '스타일 결과로 돌아가기' : 'Back to Style Results'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;