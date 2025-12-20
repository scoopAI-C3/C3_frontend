import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import AgentControlCard from './components/AgentControlCard'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AgentControlCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
