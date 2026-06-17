import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MyCycles from './pages/MyCycles'
import NewCycle from './pages/NewCycle'
import CycleDetail from './pages/CycleDetail'
import Bloodwork from './pages/Bloodwork'
import Library from './pages/Library'
import CompoundDetail from './pages/CompoundDetail'
import Calculators from './pages/Calculators'
import Profile from './pages/Profile'

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
            <Route path="cycles" element={<MyCycles />} />
            <Route path="cycles/new" element={<NewCycle />} />
            <Route path="cycles/:id" element={<CycleDetail />} />
            <Route path="bloodwork" element={<Bloodwork />} />
            <Route path="library" element={<Library />} />
            <Route path="library/:slug" element={<CompoundDetail />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}