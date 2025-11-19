import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { BookOpen, PlusCircle, BarChart3, GraduationCap } from 'lucide-react'
import CreateTutorial from './pages/CreateTutorial'
import EditTutorial from './pages/EditTutorial'
import ViewTutorial from './pages/ViewTutorial'
import Dashboard from './pages/Dashboard'
import StudentProgress from './pages/StudentProgress'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center px-2 py-2 text-primary-600 font-semibold text-lg">
                  {/* <BookOpen className="w-6 h-6 mr-2" /> */}
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
                  <Link
                    to="/create"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Tutorial
                  </Link>
                  <Link
                    to="/progress"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Meu Progresso
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateTutorial />} />
            <Route path="/edit-tutorial/:id" element={<EditTutorial />} />
            <Route path="/tutorial/:id" element={<ViewTutorial />} />
            <Route path="/progress" element={<StudentProgress />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
