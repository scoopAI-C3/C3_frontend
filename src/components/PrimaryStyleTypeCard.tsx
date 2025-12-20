import AI_Executor from '../assets/AI-DrivenExecutor.svg';
import AI_Thinker from '../assets/AI-AssistedThinker.svg';
import AI_Checker from '../assets/AI-Checker.svg';
import type { PrimaryStyle, StyleDetail } from '../types/session';

const typeImageMap: Record<string, string> = {
  'AI_CHECKER': AI_Checker,
  'AI_DRIVEN_EXECUTOR': AI_Executor,
  'AI_ASSISTED_THINKER': AI_Thinker,
};

interface PrimaryStyleTypeCardProps {
  primaryStyle: PrimaryStyle;
  styleDetail: StyleDetail;
}

const PrimaryStyleTypeCard = ({ primaryStyle, styleDetail }: PrimaryStyleTypeCardProps) => {
  const { typeCode, displayName } = primaryStyle;
  const { tagline, summary } = styleDetail;
  const typeImage = typeImageMap[typeCode] || AI_Checker;

  return (
    <div className="w-[676px] h-56 relative">
      <div className="w-full h-full absolute bg-gradient-to-br from-white/10 to-white/0 rounded-[20px] outline outline-1 outline-white/20 backdrop-blur-xl"></div>
      <div className="relative z-10 flex flex-row items-center justify-center h-full p-10 gap-12">
        <img className="w-24 h-24" src={typeImage} alt={displayName} />
        <div>
          <h1 className="font-[Inter] text-4xl font-bold  mb-2 text-white">{displayName}</h1>
          <p className="text-base text-gray-300 mb-4">"{tagline}"</p>
          <p className="text-sm text-white/50">{summary}</p>
        </div>
      </div>
    </div>
  );
};

export default PrimaryStyleTypeCard;
