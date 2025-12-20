import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { getSessionGraph } from "../apis/session";
import type { SessionGraphData } from "../types/session";
import reportBg from "../assets/reportBg.png";

const nodeNameMap: Record<string, string> = {
  extract_metrics: "지표 추출",
  analyze_patterns: "패턴 분석",
  behavior_scoring: "행동 점수화",
  llm_analysis: "AI 분석",
  determine_style: "스타일 결정",
  generate_report: "리포트 생성",
};

const levelNameMap: Record<string, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
  short: "낮음",
  long: "높음",
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
  const [graphData, setGraphData] = useState<SessionGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        let currentSessionId: string | undefined;

        // 먼저 localStorage에서 sharedSessionId 확인 (공유 페이지에서 온 경우)
        const sharedSessionId = localStorage.getItem("sharedSessionId");
        if (sharedSessionId) {
          currentSessionId = sharedSessionId;
        } else if (typeof chrome !== "undefined" && chrome.storage?.local) {
          // 크롬 확장 환경에서는 chrome.storage 사용
          const data = await chrome.storage.local.get(["sessionId"]) as { sessionId?: string };
          currentSessionId = data.sessionId;
        }

        if (currentSessionId) {
          setSessionId(currentSessionId);
          const response = await getSessionGraph(currentSessionId);
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
                  분석완료
                </div>
                <span className="text-white/40 text-xs">
                  세션 ID : {graphData?.sessionId || sessionId || "session ID - 12255ed7"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">AI 협업 패턴 분석 리포트</h1>
            </div>

            <div className="flex gap-6 text-right">
              <div>
                <div className="text-white/60 text-xs">분석 소요 시간</div>
                <div className="text-white text-lg font-medium">
                  {graphData?.graphExecution.executionTime.toFixed(1) || "0.1"} 초
                </div>
              </div>
              <div>
                <div className="text-[#BA80FF] text-xs">수행 유닛</div>
                <div className="text-[#BA80FF] text-lg font-medium">
                  {graphData?.graphExecution.nodesExecuted.length || 6} 단계
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
                <span className="text-white/70 text-sm">프롬프트 적극성</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={getLevelTagStyle(graphData?.patterns.prompt.level || "low")}
                >
                  {levelNameMap[graphData?.patterns.prompt.level || "low"] || "낮음"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-light">
                  {Math.round((graphData?.patterns.prompt.score || 0.2) * 100)}
                </span>
                <span className="text-white/40 text-lg">점</span>
              </div>
              <span className="text-white/70 text-sm">
                {graphData?.patterns.prompt.description || "선택적 AI 활용"}
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
                <span className="text-white/70 text-sm">상호작용 간격</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={getLevelTagStyle(graphData?.patterns.interval.level || "medium")}
                >
                  {levelNameMap[graphData?.patterns.interval.level || "medium"] || "보통"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-light">
                  {Math.round((graphData?.patterns.interval.score || 0.5) * 100)}
                </span>
                <span className="text-white/40 text-lg">점</span>
              </div>
              <span className="text-white/70 text-sm">
                {graphData?.patterns.interval.description || "적당한 사고 시간"}
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
                <span className="text-white/70 text-sm">결과 정교화</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={getLevelTagStyle(graphData?.patterns.refinement.level || "low")}
                >
                  {levelNameMap[graphData?.patterns.refinement.level || "low"] || "낮음"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-light">
                  {Math.round((graphData?.patterns.refinement.score || 0.3) * 100)}
                </span>
                <span className="text-white/40 text-lg">점</span>
              </div>
              <span className="text-white/70 text-sm">
                {graphData?.patterns.refinement.description || "적당한 수정 과정"}
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
                <h2 className="text-white text-xl font-semibold">선택적 AI 활용</h2>
              </div>

              <div className="flex gap-8">
                <div className="flex-1">
                  <h3 className="text-white/60 text-sm mb-4">LLM 상세 분석</h3>
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
                  <h3 className="text-white/60 text-sm mb-4">핵심 행동 패턴</h3>
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

            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                background: 'linear-gradient(90deg, #982E97 0%, #391C69 100%)',
                border: '1px solid rgba(186,128,255,0.4)',
              }}
            >
              <h2 className="text-white text-xl font-semibold mb-6">그래프 실행 트레이스 (Execution Flow)</h2>

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
              <h2 className="text-white text-xl font-semibold mb-4">수집 지표 데이터</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">✦</span>
                    <span className="text-white/80">총 프롬프트 수</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.totalPrompts || 0}회</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">⏱</span>
                    <span className="text-white/80">평균 시간 간격</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.avgInterval?.toFixed(1) || 0}초</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">✎</span>
                    <span className="text-white/80">수정 루프 횟수</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.refinementLoops || 0}회</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">★</span>
                    <span className="text-white/80">총 이벤트 발생</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.eventCount || 0}회</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: 'rgba(50,45,55,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white">✓</span>
                    <span className="text-white/80">의사결정 분기점</span>
                  </div>
                  <span className="text-white">{graphData?.metrics.decisionBoundaries || 0}회</span>
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
              <h2 className="text-white text-xl font-semibold mb-6">이벤트 유형별 분포</h2>

              <div className="space-y-4">
                {Object.entries(eventDistribution).map(([eventType, count]) => (
                  <div key={eventType}>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70 text-sm">{eventType.replace(/_/g, ' ')}</span>
                      <span className="text-white text-sm">{count}건</span>
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
            </div>

            <div className="flex justify-center pb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-8 py-3 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors cursor-pointer bg-gradient-to-r from-[#FF7DFD] to-[#A36EFF] font-medium text-lg"
              >
                스타일 결과로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;