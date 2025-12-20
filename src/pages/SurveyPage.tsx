import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextLogo from '../assets/TextLogo.png';
import { getSurveyResult } from '../apis/session';

interface SurveyQuestion {
  id: number;
  question: string;
}

// 10개의 설문 문항
const surveyQuestions: SurveyQuestion[] = [
  { id: 1, question: "AI에게 질문하기 전에, 혼자서 어느 정도 생각을 정리하는 편이다." },
  { id: 2, question: "결과가 필요할 때, 깊게 고민하기보다 빠르게 AI에게 물어보는 편이다." },
  { id: 3, question: "AI가 제안한 답변을 거의 수정 없이 그대로 사용하는 경우가 많다." },
  { id: 4, question: "AI 답변을 받은 뒤, 꼭 한 번 이상 검토하거나 수정한다." },
  { id: 5, question: "문제가 생기면, 가장 먼저 AI를 떠올리고 사용한다." },
  { id: 6, question: "AI는 참고용일 뿐, 최종 판단은 항상 내가 한다고 느낀다." },
  { id: 7, question: "같은 질문을 여러 번 표현을 바꿔가며 AI에게 묻는 편이다." },
  { id: 8, question: "AI의 답변이 마음에 들지 않으면, 다시 질문하기보다 직접 해결하려 한다." },
  { id: 9, question: "상황에 따라, AI에게 맡길 때와 직접 할 때를 의식적으로 구분한다." },
  { id: 10, question: "중요한 선택(방향, 결론)을 AI에게 맡긴 경험이 자주 있다." },
];

const scaleLabels = [
  "전혀 그렇지 않다",
  "그렇지 않다",
  "보통이다",
  "그렇다",
  "매우 그렇다",
];

// Figma 디자인에 맞는 색상
const scaleColors = [
  "#483C5D", // 1점
  "#621A66", // 2점
  "#761A9A", // 3점
  "#5F1CB7", // 4점
  "#AE3AC8", // 5점
];

// 유형 정의 (4가지만 사용)
export type CollaborationType =
  | 'AI-Driven Executor'
  | 'AI-Assisted Thinker'
  | 'AI Checker'
  | 'Balanced Collaborator';

// API typeCode 매핑
const typeCodeMap: Record<CollaborationType, string> = {
  'AI-Driven Executor': 'AI_DRIVEN_EXECUTOR',
  'AI-Assisted Thinker': 'AI_ASSISTED_THINKER',
  'AI Checker': 'AI_CHECKER',
  'Balanced Collaborator': 'BALANCED_COLLABORATOR',
};

// 점수 계산 함수
const calculateCollaborationType = (answers: Record<number, number>): {
  type: CollaborationType;
  scores: Record<CollaborationType, number>;
  axes: {
    thinkerExecutor: number; // -1: Thinker, +1: Executor
    delegatorChecker: number; // -1: Checker, +1: Delegator
    aiDrivenAssisted: number; // -1: Assisted, +1: AI-Driven
  };
} => {
  // 각 문항을 0~1로 정규화 ((점수-1)/4)
  const normalize = (questionId: number): number => {
    const score = answers[questionId] || 3; // 기본값 3 (보통)
    return (score - 1) / 4;
  };

  // 축별 계산
  // Thinker ↔ Executor: Q1 vs Q2 (Q1 높으면 Thinker, Q2 높으면 Executor)
  const thinkerExecutor = normalize(2) - normalize(1); // -1 ~ +1

  // Delegator ↔ Checker: Q3 vs Q4 (Q3 높으면 Delegator, Q4 높으면 Checker)
  const delegatorChecker = normalize(3) - normalize(4); // -1 ~ +1

  // AI-Driven ↔ Assisted: Q5 vs Q6 (Q5 높으면 AI-Driven, Q6 높으면 Assisted)
  const aiDrivenAssisted = normalize(5) - normalize(6); // -1 ~ +1

  // 유형별 점수 계산 (4가지 유형만)
  const scores: Record<CollaborationType, number> = {
    // AI-Driven Executor: Q2, Q3, Q5, Q10 높음
    'AI-Driven Executor': (normalize(2) + normalize(3) + normalize(5) + normalize(10)) / 4,

    // AI-Assisted Thinker: Q1, Q7 높음
    'AI-Assisted Thinker': (normalize(1) + normalize(7)) / 2,

    // AI Checker: Q4, Q8 높음
    'AI Checker': (normalize(4) + normalize(8)) / 2,

    // Balanced Collaborator: Q1, Q6, Q9 높음
    'Balanced Collaborator': (normalize(1) + normalize(6) + normalize(9)) / 3,
  };

  // Q9가 높고 극단값이 낮으면 Balanced Collaborator 보정
  const q9Score = normalize(9);
  const extremeScore = Math.max(
    Math.abs(thinkerExecutor),
    Math.abs(delegatorChecker),
    Math.abs(aiDrivenAssisted)
  );

  if (q9Score > 0.6 && extremeScore < 0.3) {
    scores['Balanced Collaborator'] *= 1.3; // 30% 보정
  }

  // 가장 높은 점수의 유형 선택
  let maxType: CollaborationType = 'Balanced Collaborator';
  let maxScore = -1;

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = type as CollaborationType;
    }
  }

  return {
    type: maxType,
    scores,
    axes: {
      thinkerExecutor,
      delegatorChecker,
      aiDrivenAssisted,
    },
  };
};

const SurveyPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // 설문 완료 - 결과 계산
      const result = calculateCollaborationType(answers);
      console.log('Survey Result:', result);

      // API 호출
      setIsLoading(true);
      try {
        const typeCode = typeCodeMap[result.type];
        const apiResponse = await getSurveyResult(typeCode);

        if (apiResponse.isSuccess) {
          // localStorage에 결과 저장
          localStorage.setItem('surveyResult', JSON.stringify({
            answers,
            calculatedResult: result,
            apiResult: apiResponse.result,
            timestamp: new Date().toISOString(),
          }));

          navigate('/dashboard');
        } else {
          console.error('API Error:', apiResponse.message);
          // 실패해도 계산된 결과로 이동
          localStorage.setItem('surveyResult', JSON.stringify({
            answers,
            calculatedResult: result,
            timestamp: new Date().toISOString(),
          }));
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('API Call Failed:', error);
        // 실패해도 계산된 결과로 이동
        localStorage.setItem('surveyResult', JSON.stringify({
          answers,
          calculatedResult: result,
          timestamp: new Date().toISOString(),
        }));
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const question = surveyQuestions[currentQuestion];
  const selectedValue = answers[question.id];
  const isLastQuestion = currentQuestion === surveyQuestions.length - 1;
  const canProceed = selectedValue !== undefined;

  return (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-[#211F26]">
      {/* Header */}
      <header className="flex items-center justify-between w-full pt-[42px] px-[62px]">
        <img className="w-[184px] h-[37px]" src={TextLogo} alt="Text Logo" />
        <span className="text-white/50 text-sm font-medium font-[NanumSquareRound]">
          {currentQuestion + 1} / {surveyQuestions.length}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 w-full px-8">
        {/* Question */}
        <h1 className="text-[32px] font-bold text-white text-center mb-[75px] font-[NanumSquareRoundOTF] leading-[42px]">
          {question.question}
        </h1>

        {/* Likert Scale */}
        <div className="w-full max-w-[983px]">
          {/* Scale Line + Points */}
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-[18px] right-[18px] h-[5px] bg-[#482D71] rounded-full" />

            {/* Scale Points */}
            {[1, 2, 3, 4, 5].map((value, index) => (
              <button
                key={value}
                onClick={() => handleAnswer(question.id, value)}
                className="relative z-10 w-[37px] h-[37px] rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: scaleColors[index],
                  boxShadow: selectedValue === value ? '0 0 0 5px white' : 'none',
                  transform: selectedValue === value ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between mt-[23px]">
            {scaleLabels.map((label, index) => (
              <span
                key={index}
                className="text-white text-[14px] font-bold font-[NanumSquareRoundOTF] text-center"
                style={{ width: index === 0 || index === 4 ? '100px' : index === 2 ? '60px' : '80px' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-6 mt-[54px]">
          {currentQuestion > 0 && (
            <button
              onClick={handlePrev}
              className="w-[337px] h-[98px] rounded-[28px] border-2 border-white/30 text-white/70 text-[26px] font-medium font-[Inter] hover:bg-white/10 transition-colors cursor-pointer"
            >
              이전
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className={`w-[337px] h-[98px] rounded-[28px] text-[26px] font-medium font-[Inter] transition-all duration-200 ${
              canProceed && !isLoading
                ? 'bg-gradient-to-r from-[#C930C7] to-[#A36EFF] text-white cursor-pointer hover:opacity-90'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isLoading ? '분석 중...' : isLastQuestion ? '결과 확인' : '다음'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default SurveyPage;
