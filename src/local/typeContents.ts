import type { StyleDetail } from '../types/session'
import type { Lang, TypeCode } from './texts'

/**
 * 협업 스타일별 상세 문구 (한/영).
 * 예전에는 백엔드 DB(ai_collaboration_type_content)에 있던 고정 데이터를 그대로 옮긴 것이다.
 */
export const TYPE_CONTENTS: Record<TypeCode, Record<Lang, StyleDetail>> = {
  "AI_DRIVEN_EXECUTOR": {
    "ko": {
      "tagline": "AI를 실행 파트너로 사용하는 타입",
      "summary": "당신은 AI를 도구가 아닌 실행의 주체로 활용합니다. 빠른 프로토타이핑과 결과 도출에 최적화된 협업 방식을 가지고 있습니다.",
      "todayMessage": "오늘 당신은 AI를 실행 파트너로 삼아 가장 빠른 선택을 반복한 하루를 보냈습니다.",
      "description": "당신은 결정 이후의 실행 속도를 가장 중요하게 여깁니다. 완벽하게 생각이 정리되기를 기다리기보다, AI를 통해 빠르게 결과를 만들고 움직이는 쪽에 가깝습니다. AI는 당신에게 '참고 자료'가 아니라 함께 일하는 실행 파트너입니다.",
      "catchphrase": "AI와 함께 가장 빠르게 앞으로 나아가는 실행형 협업자",
      "detailStrengths": [
        "빠른 프로토타이핑과 아이디어 검증",
        "실행 속도 극대화",
        "해커톤, MVP 개발에 최적화"
      ],
      "detailCautions": [
        "중요한 의사결정 시 신중함 필요",
        "장기적 전략 수립 시 깊은 사고 병행 권장"
      ],
      "tip": "AI의 빠른 실행력을 활용하되, 중요한 결정에서는 한 템포 쉬어가는 것도 좋습니다."
    },
    "en": {
      "tagline": "A type that uses AI as an execution partner",
      "summary": "You utilize AI not as a tool, but as the main driver of execution. Your collaboration style is optimized for rapid prototyping and delivering results.",
      "todayMessage": "Today, you partnered with AI to make the fastest decisions repeatedly.",
      "description": "You prioritize execution speed after making decisions. Rather than waiting for your thoughts to be perfectly organized, you prefer to quickly produce results and move forward with AI. AI is not just a \"reference\" for you—it is an execution partner you work with.",
      "catchphrase": "An execution-focused collaborator moving forward fastest with AI",
      "detailStrengths": [
        "Rapid prototyping and idea validation",
        "Maximized execution speed",
        "Optimized for hackathons and MVP development"
      ],
      "detailCautions": [
        "Need for careful consideration in important decisions",
        "Recommended to incorporate deeper thinking for long-term strategy"
      ],
      "tip": "Leverage AI's quick execution power, but for critical decisions, it's good to take a moment to pause."
    }
  },
  "AI_ASSISTED_THINKER": {
    "ko": {
      "tagline": "AI와 함께 깊이 생각하는 타입",
      "summary": "당신은 AI를 사고의 파트너로 활용합니다. 결론을 내리기 전 다양한 관점을 탐색하고, AI와의 대화를 통해 생각을 발전시키는 협업 방식을 가지고 있습니다.",
      "todayMessage": "오늘 당신은 AI와 깊은 대화를 나누며 생각을 확장한 하루를 보냈습니다.",
      "description": "당신은 AI를 단순한 답변 제공자가 아닌 사고의 동반자로 여깁니다. \"이건 어떻게 생각해?\", \"다른 관점은 없을까?\"와 같은 질문을 통해 AI와 함께 문제를 탐구합니다. 최종 판단은 당신이 하지만, 그 과정에서 AI의 시각을 적극 활용합니다.",
      "catchphrase": "AI와의 대화로 사고를 확장하는 깊이 있는 협업자",
      "detailStrengths": [
        "다양한 관점에서의 문제 분석",
        "깊이 있는 의사결정",
        "창의적 아이디어 발굴"
      ],
      "detailCautions": [
        "빠른 결정이 필요한 상황에서 시간 소요",
        "단순 작업에서는 과도한 분석 가능성"
      ],
      "tip": "깊이 있는 사고는 큰 장점입니다. 다만 상황에 따라 속도와 깊이의 균형을 조절해보세요."
    },
    "en": {
      "tagline": "A type that thinks deeply with AI",
      "summary": "You utilize AI as a thinking partner. Your collaboration style involves exploring various perspectives before reaching conclusions and developing ideas through conversations with AI.",
      "todayMessage": "Today, you expanded your thinking through deep conversations with AI.",
      "description": "You view AI not as a simple answer provider, but as a companion in thinking. You prefer questions like \"What do you think about this?\" or \"Are there other perspectives?\" to explore problems together with AI. The final judgment is yours, but you actively utilize AI's perspective in the process.",
      "catchphrase": "A deep collaborator who expands thinking through AI conversations",
      "detailStrengths": [
        "Problem analysis from multiple perspectives",
        "Deep and thoughtful decision-making",
        "Creative idea discovery"
      ],
      "detailCautions": [
        "Time consumption in situations requiring quick decisions",
        "Possibility of over-analysis in simple tasks"
      ],
      "tip": "Deep thinking is a great strength. However, try to balance speed and depth depending on the situation."
    }
  },
  "AI_CHECKER": {
    "ko": {
      "tagline": "AI를 검증 파트너로 활용하는 타입",
      "summary": "당신은 먼저 스스로 생각하고 결정한 후, AI를 통해 검증하고 보완합니다. 주체적인 판단력을 유지하면서 AI를 품질 관리 도구로 활용하는 협업 방식입니다.",
      "todayMessage": "오늘 당신은 스스로의 판단을 AI와 함께 검증하며 완성도를 높인 하루를 보냈습니다.",
      "description": "당신은 AI에게 먼저 답을 구하기보다, 자신의 생각을 정리한 후 AI를 통해 확인합니다. \"이 방향이 맞을까?\", \"놓친 부분이 있을까?\"와 같은 검증 중심의 질문을 선호합니다. AI는 당신에게 2차 검토자이자 품질 보증 파트너입니다.",
      "catchphrase": "주체적 판단과 AI 검증의 균형을 이루는 신중한 협업자",
      "detailStrengths": [
        "높은 주체성과 독립적 사고력",
        "결과물의 완성도와 정확성",
        "신중하고 안정적인 의사결정"
      ],
      "detailCautions": [
        "AI의 창의적 활용 기회를 놓칠 수 있음",
        "새로운 아이디어 탐색에 소극적일 수 있음"
      ],
      "tip": "검증 중심의 활용도 훌륭합니다. 가끔은 AI에게 새로운 아이디어를 요청해보는 것도 좋습니다."
    },
    "en": {
      "tagline": "A type that uses AI as a verification partner",
      "summary": "You think and decide on your own first, then verify and supplement through AI. This collaboration style maintains independent judgment while using AI as a quality control tool.",
      "todayMessage": "Today, you verified your own judgments with AI to enhance quality.",
      "description": "Rather than asking AI for answers first, you organize your thoughts and then verify through AI. You prefer verification-focused questions like \"Is this direction correct?\" or \"Did I miss anything?\" AI is your secondary reviewer and quality assurance partner.",
      "catchphrase": "A careful collaborator balancing independent judgment and AI verification",
      "detailStrengths": [
        "High independence and autonomous thinking",
        "Completeness and accuracy of results",
        "Careful and stable decision-making"
      ],
      "detailCautions": [
        "May miss opportunities for creative AI utilization",
        "May be passive in exploring new ideas"
      ],
      "tip": "Verification-focused usage is excellent. Sometimes try asking AI for new ideas as well."
    }
  },
  "BALANCED_COLLABORATOR": {
    "ko": {
      "tagline": "상황에 맞게 AI를 유연하게 활용하는 타입",
      "summary": "당신은 상황에 따라 AI 활용 방식을 유연하게 조절합니다. 때로는 빠른 실행을, 때로는 깊은 사고를, 때로는 검증을 요청하며 최적의 협업 방식을 찾아갑니다.",
      "todayMessage": "오늘 당신은 상황에 맞게 AI와 유연하게 협업하며 균형 잡힌 하루를 보냈습니다.",
      "description": "당신은 하나의 협업 패턴에 고정되지 않습니다. 급한 작업에서는 AI의 실행력을, 중요한 결정에서는 함께 사고하는 방식을, 최종 점검에서는 검증 도구로 AI를 활용합니다. 유연성이 당신의 가장 큰 강점입니다.",
      "catchphrase": "모든 상황에서 최적의 AI 협업을 찾아가는 유연한 협업자",
      "detailStrengths": [
        "상황별 최적의 AI 활용",
        "높은 적응력과 유연성",
        "다양한 업무 유형 대응 가능"
      ],
      "detailCautions": [
        "일관된 전략 부재로 효율 저하 가능성",
        "상황 판단에 에너지 소모"
      ],
      "tip": "유연함은 큰 장점입니다. 자주 사용하는 패턴을 정리해두면 더 효율적인 협업이 가능합니다."
    },
    "en": {
      "tagline": "A type that flexibly utilizes AI according to the situation",
      "summary": "You flexibly adjust your AI utilization method according to the situation. Sometimes you request quick execution, sometimes deep thinking, and sometimes verification, finding the optimal collaboration method.",
      "todayMessage": "Today, you collaborated flexibly with AI according to each situation, maintaining balance.",
      "description": "You are not fixed to one collaboration pattern. For urgent tasks, you utilize AI's execution power; for important decisions, you think together; and for final checks, you use AI as a verification tool. Flexibility is your greatest strength.",
      "catchphrase": "A flexible collaborator finding optimal AI collaboration in every situation",
      "detailStrengths": [
        "Optimal AI utilization for each situation",
        "High adaptability and flexibility",
        "Capable of handling various work types"
      ],
      "detailCautions": [
        "Possible efficiency reduction due to lack of consistent strategy",
        "Energy consumption in situational judgment"
      ],
      "tip": "Flexibility is a great advantage. Organizing frequently used patterns can enable more efficient collaboration."
    }
  }
}
