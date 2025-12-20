import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import AgentControlCard from './components/AgentControlCard'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import SurveyIntroPage from './pages/SurveyIntroPage'
import SurveyPage from './pages/SurveyPage'
import ReportPage from './pages/ReportPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AgentControlCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/survey-intro" element={<SurveyIntroPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
