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
    <div className="flex flex-col w-[540px] h-[720px] bg-white p-10 gap-5 font-[Inter]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-[#EDDDFF]" />
        <h1 className="text-xl font-semibold text-black">Agent Control</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-medium text-black">Monitoring</span>
          <button
            onClick={handleMonitoringToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isMonitoring ? "bg-[#9130FF]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                isMonitoring ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#919191]">Agent Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 ${statusStyle.dot} rounded-full`}></span>
            <span className={`text-sm font-medium ${statusStyle.text}`}>
              {agentStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#919191]">Decision Risk</span>
          <span className={`text-sm font-medium ${getRiskColor(decisionRisk)}`}>
            {decisionRisk}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-[#989898] tracking-wider mb-3">
          RECENT EVENTS
        </h2>
        <div className="space-y-0">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-start gap-3 py-2">
              <div className="relative pl-3 border-l-2 border-[#CFCFCF]">
                <span className="text-[#989898] mr-5">{event.time}</span>
                <span className="text-[#676767]">{event.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="w-full mt-6 py-3 text-sm text-purple-600 hover:text-purple-700 font-medium hover:bg-purple-50 rounded-lg transition-colors"
        onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('index.html#/landing') })}
      >
        Open Full Dashboard →
      </button>
    </div>
  );
}

export default AgentControlCard;
