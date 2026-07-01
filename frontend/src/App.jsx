import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SavingsPage from './pages/SavingsPage'
import SavingsDetailPage from './pages/SavingsDetailPage'
import TransactionsPage from './pages/TransactionsPage'
import SharedPage from './pages/SharedPage'
import SharedDetailPage from './pages/SharedDetailPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><SavingsPage /></ProtectedRoute>} />
          <Route path="/savings/:id" element={<ProtectedRoute><SavingsDetailPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/shared" element={<ProtectedRoute><SharedPage /></ProtectedRoute>} />
          <Route path="/shared/:id" element={<ProtectedRoute><SharedDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
