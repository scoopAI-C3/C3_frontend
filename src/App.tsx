import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { LanguageProvider } from './contexts/LanguageContext'
import AgentControlCard from './components/AgentControlCard'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import SurveyIntroPage from './pages/SurveyIntroPage'
import SurveyPage from './pages/SurveyPage'
import ReportPage from './pages/ReportPage'
import SharedPage from './pages/SharedPage'
import HomePage from './pages/HomePage'

// 확장 프로그램 안에서 열리면 팝업, 웹(Vercel)에서 열리면 소개 페이지
const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={isExtension ? <AgentControlCard /> : <HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/survey-intro" element={<SurveyIntroPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/share/:shareToken" element={<SharedPage />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  )
}

export default App
