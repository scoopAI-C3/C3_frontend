import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
      <button
        onClick={() => setLanguage('ko')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${
          language === 'ko'
            ? 'bg-white text-[#211F26]'
            : 'text-white/60 hover:text-white'
        }`}
      >
        KR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white text-[#211F26]'
            : 'text-white/60 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
