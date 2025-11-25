import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { BookOpen, PlusCircle, BarChart3, GraduationCap, Users, LogOut } from 'lucide-react'
import CreateTutorial from './pages/CreateTutorial'
import EditTutorial from './pages/EditTutorial'
import ViewTutorial from './pages/ViewTutorial'
import Dashboard from './pages/Dashboard'
import StudentProgress from './pages/StudentProgress'
import Login from './pages/Login'
import UsersPage from './pages/Users'
import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './services/authStore'

function App() {
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && (
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link to="/" className="flex items-center px-2 py-2 text-primary-600 font-semibold text-lg">
                    📖 DPGDOC ACADEMY
                  </Link>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/create"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Criar Tutorial
                      </Link>
                    )}
                    <Link
                      to="/progress"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Meu Progresso
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/users"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Usuários
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{user?.full_name || user?.username}</span>
                    <span className="ml-2 text-gray-500">({user?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className={isAuthenticated ? 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8' : ''}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CreateTutorial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-tutorial/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditTutorial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutorial/:id"
              element={
                <ProtectedRoute>
                  <ViewTutorial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <StudentProgress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
