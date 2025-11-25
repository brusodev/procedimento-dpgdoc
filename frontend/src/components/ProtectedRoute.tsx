import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../services/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'admin' | 'instructor' | 'student'>
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect to dashboard
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
