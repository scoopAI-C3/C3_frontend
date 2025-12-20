import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Event {
  time: string;
  message: string;
}

function AgentControlCard() {
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [agentStatus] = useState<
    "Observing" | "Approaching Decision Boundary" | "Intervention Triggered"
  >("Observing");
  const [decisionRisk] = useState<"High" | "Medium" | "Low">("High");

  const recentEvents: Event[] = [
    { time: "09:37", message: "Intervention triggered" },
    { time: "09:37", message: "Decision Boundary detected" },
    { time: "09:37", message: "Session: Active" },
  ];

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
            onClick={() => setIsMonitoring(!isMonitoring)}
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
        onClick={() => navigate("/dashboard")}
      >
        Open Full Dashboard →
      </button>
    </div>
  );
}

export default AgentControlCard;
