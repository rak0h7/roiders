import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CyclePlanner from './pages/CyclePlanner'
import CycleLog from './pages/CycleLog'
import NewCycle from './pages/NewCycle'
import PlanDetail from './pages/PlanDetail'
import LogDetail from './pages/LogDetail'
import Bloodwork from './pages/Bloodwork'
import Library from './pages/Library'
import CompoundDetail from './pages/CompoundDetail'
import Calculators from './pages/Calculators'
import Profile from './pages/Profile'
import HealthLog from './pages/HealthLog'

function LegacyCycleRedirect() {
  const { id } = useParams()
  return <Navigate to={`/planner/${id}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="planner" element={<CyclePlanner />} />
            <Route path="planner/new" element={<NewCycle />} />
            <Route path="planner/:id" element={<PlanDetail />} />
            <Route path="log" element={<CycleLog />} />
            <Route path="log/:id" element={<LogDetail />} />
            <Route path="bloodwork" element={<Bloodwork />} />
            <Route path="health" element={<HealthLog />} />
            <Route path="library" element={<Library />} />
            <Route path="library/:slug" element={<CompoundDetail />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="profile" element={<Profile />} />
            {/* Legacy redirects */}
            <Route path="cycles" element={<Navigate to="/planner" replace />} />
            <Route path="cycles/new" element={<Navigate to="/planner/new" replace />} />
            <Route path="cycles/:id" element={<LegacyCycleRedirect />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}