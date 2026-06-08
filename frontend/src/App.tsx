import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Companies } from './pages/Companies'
import { CompanyDetail } from './pages/CompanyDetail'
import { Contracts } from './pages/Contracts'
import { Transparency } from './pages/Transparency'
import { Decisions } from './pages/Decisions'
import { OpenData } from './pages/OpenData'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/empresas" element={<Companies />} />
        <Route path="/empresa/:slug" element={<CompanyDetail />} />
        <Route path="/contrataciones" element={<Contracts />} />
        <Route path="/transparencia" element={<Transparency />} />
        <Route path="/decisiones" element={<Decisions />} />
        <Route path="/datos" element={<OpenData />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
