import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Korean translations
const ko: Record<string, string> = {
  // Landing Page
  'landing.title1': '나는 AI와',
  'landing.title2': '어떻게 협업하고 있을까?',
  'landing.subtitle': 'AI 협업 스타일 분석 서비스',
  'landing.description': '당신의 AI 활용 패턴을 분석하고,\n나만의 협업 스타일을 발견해보세요.',
  'landing.startButton': '분석 시작하기',
  'landing.surveyButton': '설문으로 시작하기',

  // Survey Page
  'survey.q1': 'AI에게 질문하기 전에, 혼자서 어느 정도 생각을 정리하는 편이다.',
  'survey.q2': '결과가 필요할 때, 깊게 고민하기보다 빠르게 AI에게 물어보는 편이다.',
  'survey.q3': 'AI가 제안한 답변을 거의 수정 없이 그대로 사용하는 경우가 많다.',
  'survey.q4': 'AI 답변을 받은 뒤, 꼭 한 번 이상 검토하거나 수정한다.',
  'survey.q5': '문제가 생기면, 가장 먼저 AI를 떠올리고 사용한다.',
  'survey.q6': 'AI는 참고용일 뿐, 최종 판단은 항상 내가 한다고 느낀다.',
  'survey.q7': '같은 질문을 여러 번 표현을 바꿔가며 AI에게 묻는 편이다.',
  'survey.q8': 'AI의 답변이 마음에 들지 않으면, 다시 질문하기보다 직접 해결하려 한다.',
  'survey.q9': '상황에 따라, AI에게 맡길 때와 직접 할 때를 의식적으로 구분한다.',
  'survey.q10': '중요한 선택(방향, 결론)을 AI에게 맡긴 경험이 자주 있다.',
  'survey.scale1': '전혀 그렇지 않다',
  'survey.scale2': '그렇지 않다',
  'survey.scale3': '보통이다',
  'survey.scale4': '그렇다',
  'survey.scale5': '매우 그렇다',
  'survey.prev': '이전',
  'survey.next': '다음',
  'survey.submit': '결과 확인',
  'survey.analyzing': '분석 중...',

  // Dashboard
  'dashboard.dataTitle': '데이터가 이렇게 말하고 있어요',
  'dashboard.aiUsage': 'AI 사용 빈도',
  'dashboard.avgInterval': '질문 간 평균 간격',
  'dashboard.refinementRate': '수정/재질문 비율',
  'dashboard.decisionEvent': 'Decision Event',
  'dashboard.decisionFrequency': '발생빈도',
  'dashboard.share': 'Share',
  'dashboard.detailReport': '상세 리포트 보기',
  'dashboard.backToHome': '처음으로 돌아가기',

  // Data values
  'data.high': '높음',
  'data.medium': '중간',
  'data.low': '낮음',
  'data.short': '짧음',
  'data.long': '긴 편',
  'data.many': '많음',
  'data.few': '적음',

  // Report Page
  'report.title': 'AI 협업 패턴 분석 리포트',
  'report.complete': '분석완료',
  'report.sessionId': '세션 ID',
  'report.executionTime': '분석 소요 시간',
  'report.executionUnit': '수행 유닛',
  'report.seconds': '초',
  'report.steps': '단계',
  'report.promptActive': '프롬프트 적극성',
  'report.interactionInterval': '상호작용 간격',
  'report.refinement': '결과 정교화',
  'report.score': '점',
  'report.selectiveAI': '선택적 AI 활용',
  'report.llmAnalysis': 'LLM 상세 분석',
  'report.corePattern': '핵심 행동 패턴',
  'report.executionFlow': '그래프 실행 트레이스 (Execution Flow)',
  'report.metricsData': '수집 지표 데이터',
  'report.totalPrompts': '총 프롬프트 수',
  'report.avgTimeInterval': '평균 시간 간격',
  'report.refinementLoops': '수정 루프 횟수',
  'report.totalEvents': '총 이벤트 발생',
  'report.decisionBoundaries': '의사결정 분기점',
  'report.eventDistribution': '이벤트 유형별 분포',
  'report.backToStyle': '스타일 결과로 돌아가기',
  'report.times': '회',
  'report.cases': '건',

  // Execution nodes
  'node.extractMetrics': '지표 추출',
  'node.analyzePatterns': '패턴 분석',
  'node.behaviorScoring': '행동 점수화',
  'node.llmAnalysis': 'AI 분석',
  'node.determineStyle': '스타일 결정',
  'node.generateReport': '리포트 생성',

  // Levels
  'level.high': '높음',
  'level.medium': '보통',
  'level.low': '낮음',

  // Style Result Section
  'style.yourStyle': '당신의 AI 협업 스타일은',
  'style.strengths': '강점',
  'style.cautions': '주의점',
  'style.tip': '오늘의 팁',

  // Strength/Weakness Section
  'section.strengths': '이런 점이 좋아요',
  'section.cautions': '이런 점은 주의해요',
  'section.tip': '오늘의 한마디',
};

// English translations
const en: Record<string, string> = {
  // Landing Page
  'landing.title1': 'How do I',
  'landing.title2': 'collaborate with AI?',
  'landing.subtitle': 'AI Collaboration Style Analysis Service',
  'landing.description': 'Analyze your AI usage patterns\nand discover your unique collaboration style.',
  'landing.startButton': 'Start Analysis',
  'landing.surveyButton': 'Start with Survey',

  // Survey Page
  'survey.q1': 'I tend to organize my thoughts before asking AI questions.',
  'survey.q2': 'When I need results, I tend to ask AI quickly rather than thinking deeply.',
  'survey.q3': 'I often use AI-suggested answers with little to no modification.',
  'survey.q4': 'After receiving an AI response, I always review or modify it at least once.',
  'survey.q5': 'When a problem arises, AI is the first thing I think of and use.',
  'survey.q6': 'I feel that AI is just for reference, and I always make the final judgment.',
  'survey.q7': 'I tend to ask the same question to AI multiple times with different expressions.',
  'survey.q8': 'If I\'m not satisfied with AI\'s answer, I prefer to solve it myself rather than asking again.',
  'survey.q9': 'I consciously distinguish between when to delegate to AI and when to do it myself.',
  'survey.q10': 'I often have experiences of entrusting important decisions to AI.',
  'survey.scale1': 'Strongly Disagree',
  'survey.scale2': 'Disagree',
  'survey.scale3': 'Neutral',
  'survey.scale4': 'Agree',
  'survey.scale5': 'Strongly Agree',
  'survey.prev': 'Previous',
  'survey.next': 'Next',
  'survey.submit': 'See Results',
  'survey.analyzing': 'Analyzing...',

  // Dashboard
  'dashboard.dataTitle': 'This is what the data says',
  'dashboard.aiUsage': 'AI Usage Frequency',
  'dashboard.avgInterval': 'Avg. Question Interval',
  'dashboard.refinementRate': 'Refinement Rate',
  'dashboard.decisionEvent': 'Decision Event',
  'dashboard.decisionFrequency': 'Frequency',
  'dashboard.share': 'Share',
  'dashboard.detailReport': 'View Detailed Report',
  'dashboard.backToHome': 'Back to Home',

  // Data values
  'data.high': 'High',
  'data.medium': 'Medium',
  'data.low': 'Low',
  'data.short': 'Short',
  'data.long': 'Long',
  'data.many': 'Many',
  'data.few': 'Few',

  // Report Page
  'report.title': 'AI Collaboration Pattern Analysis Report',
  'report.complete': 'Complete',
  'report.sessionId': 'Session ID',
  'report.executionTime': 'Analysis Time',
  'report.executionUnit': 'Execution Units',
  'report.seconds': 'sec',
  'report.steps': 'steps',
  'report.promptActive': 'Prompt Activeness',
  'report.interactionInterval': 'Interaction Interval',
  'report.refinement': 'Result Refinement',
  'report.score': 'pts',
  'report.selectiveAI': 'Selective AI Usage',
  'report.llmAnalysis': 'LLM Detailed Analysis',
  'report.corePattern': 'Core Behavior Patterns',
  'report.executionFlow': 'Graph Execution Trace (Execution Flow)',
  'report.metricsData': 'Collected Metrics Data',
  'report.totalPrompts': 'Total Prompts',
  'report.avgTimeInterval': 'Avg. Time Interval',
  'report.refinementLoops': 'Refinement Loops',
  'report.totalEvents': 'Total Events',
  'report.decisionBoundaries': 'Decision Boundaries',
  'report.eventDistribution': 'Event Type Distribution',
  'report.backToStyle': 'Back to Style Results',
  'report.times': 'times',
  'report.cases': 'cases',

  // Execution nodes
  'node.extractMetrics': 'Extract Metrics',
  'node.analyzePatterns': 'Analyze Patterns',
  'node.behaviorScoring': 'Behavior Scoring',
  'node.llmAnalysis': 'AI Analysis',
  'node.determineStyle': 'Determine Style',
  'node.generateReport': 'Generate Report',

  // Levels
  'level.high': 'High',
  'level.medium': 'Medium',
  'level.low': 'Low',

  // Style Result Section
  'style.yourStyle': 'Your AI Collaboration Style is',
  'style.strengths': 'Strengths',
  'style.cautions': 'Cautions',
  'style.tip': 'Today\'s Tip',

  // Strength/Weakness Section
  'section.strengths': 'These are your strengths',
  'section.cautions': 'Keep these in mind',
  'section.tip': 'Today\'s Message',
};

const translations: Record<Language, Record<string, string>> = { ko, en };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ko';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
