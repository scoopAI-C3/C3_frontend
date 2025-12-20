import { useState, useEffect } from "react";
import type { AgentEvent, AgentStatusType, RiskType, DisplayEvent } from "../types/agent";

function AgentControlCard() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [agentStatus, setAgentStatus] = useState<AgentStatusType>("Inactive");
  const [decisionRisk, setDecisionRisk] = useState<RiskType>("Low");
  const [recentEvents, setRecentEvents] = useState<DisplayEvent[]>([]);

  // 모니터링 토글 핸들러
  const handleMonitoringToggle = async () => {
    const newValue = !isMonitoring;
    setIsMonitoring(newValue);
    await chrome.storage.local.set({ isMonitoring: newValue });

    if (!newValue) {
      await chrome.storage.local.set({
        agentStatus: 'Inactive',
        decisionRisk: 'Low'
      });
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await chrome.storage.local.get(['events', 'agentStatus', 'decisionRisk', 'isMonitoring']) as {
          events?: AgentEvent[];
          agentStatus?: AgentStatusType;
          decisionRisk?: RiskType;
          isMonitoring?: boolean;
        };

        if (data.isMonitoring !== undefined) {
          setIsMonitoring(data.isMonitoring);
        } else {
          await chrome.storage.local.set({ isMonitoring: true });
        }

        if (data.agentStatus) {
          setAgentStatus(data.agentStatus);
        }
        if (data.decisionRisk) {
          setDecisionRisk(data.decisionRisk);
        }
        if (data.events && Array.isArray(data.events)) {
          const displayEvents: DisplayEvent[] = data.events.slice(0, 5).map((event: AgentEvent) => ({
            time: new Date(event.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            message: event.message
          }));
          setRecentEvents(displayEvents);
        }
      } catch (err) {
        console.error('[HANDOFF] Failed to load events:', err);
      }
    };

    loadEvents();

    // storage 변경 감지
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.events?.newValue && Array.isArray(changes.events.newValue)) {
        const displayEvents: DisplayEvent[] = changes.events.newValue.slice(0, 5).map((event: AgentEvent) => ({
          time: new Date(event.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          message: event.message
        }));
        setRecentEvents(displayEvents);
      }
      if (changes.agentStatus?.newValue) {
        setAgentStatus(changes.agentStatus.newValue as AgentStatusType);
      }
      if (changes.decisionRisk?.newValue) {
        setDecisionRisk(changes.decisionRisk.newValue as RiskType);
      }
      if (changes.isMonitoring?.newValue !== undefined) {
        setIsMonitoring(changes.isMonitoring.newValue as boolean);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "text-[#DF6E4E]";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-[#0FB900]";
      default:
        return "text-gray-500";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Intervention Triggered":
        return { dot: "bg-[#DF6E4E]", text: "text-[#DF6E4E]" };
      case "Approaching Decision Boundary":
        return { dot: "bg-yellow-500", text: "text-yellow-500" };
      case "Observing":
        return { dot: "bg-[#0FB900]", text: "text-[#0FB900]" };
      case "Inactive":
        return { dot: "bg-gray-400", text: "text-gray-400" };
      default:
        return { dot: "bg-gray-500", text: "text-gray-500" };
    }
  };
  const statusStyle = getStatusStyle(agentStatus);
  return (
    <div className="flex flex-col w-[360px] h-[500px] bg-[#211F26] p-10 gap-5 font-[Inter] overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl border-2 border-[#A36EFF] bg-[#2B2930] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9H21.5L16 13.5L18 21L12 16.5L6 21L8 13.5L2.5 9H9.5L12 2Z" fill="url(#sparkleGradient)" />
            <path d="M19 8L20 10.5H22.5L20.5 12L21.5 14.5L19 12.5L16.5 14.5L17.5 12L15.5 10.5H18L19 8Z" fill="url(#sparkleGradient)" />
            <defs>
              <linearGradient id="sparkleGradient" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF7DFD" />
                <stop offset="1" stopColor="#A36EFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">선택적 AI 활용</h1>
      </div>

      <div className="bg-[#2B2930] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <span className="text-lg font-semibold text-white">Monitoring</span>
          <button
            onClick={handleMonitoringToggle}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              isMonitoring ? "bg-[#A36EFF]" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-[#211F26] rounded-full shadow transition-transform duration-200 ${
                isMonitoring ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-base text-white/60">Agent Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 ${statusStyle.dot} rounded-full`}></span>
            <span className={`text-base font-medium ${statusStyle.text}`}>
              {agentStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-white/60">Decision Risk</span>
          <span className={`text-base font-medium ${getRiskColor(decisionRisk)}`}>
            {decisionRisk}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-white tracking-wider mb-4">
          RECENT EVENTS
        </h2>
        <div className="space-y-0">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-start py-3">
              <div
                className="w-0.5 h-full min-h-[40px] mr-4 rounded-full"
                style={{ background: `linear-gradient(180deg, #FF7DFD ${index * 30}%, #A36EFF 100%)` }}
              />
              <div className="flex items-center gap-4">
                <span className="text-white/50 text-sm">{event.time}</span>
                <span className="text-white text-sm">{event.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="w-full mt-auto py-3 text-sm text-[#A36EFF] hover:text-[#FF7DFD] font-medium hover:bg-white/5 rounded-lg transition-colors"
        onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('index.html#/landing') })}
      >
        Open Full Dashboard →
      </button>
    </div>
  );
}

export default AgentControlCard;
