import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import AgentControlCard from './components/AgentControlCard'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AgentControlCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  )
}

export default App
