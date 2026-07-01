import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../layout/AppLayout'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--color-text-3)'
      }}>
        Memuat...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <AppLayout>{children}</AppLayout>
}
