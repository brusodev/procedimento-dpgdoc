import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Play, Calendar } from 'lucide-react'
import { tutorialApi, analyticsApi } from '@/services/api'

interface TutorialListItem {
  id: string
  title: string
  description?: string
  category?: string
  tags: string[]
  created_at: string
  is_published: boolean
  step_count: number
}

interface DashboardStats {
  total_tutorials: number
  published_tutorials: number
  in_progress: number
  completed: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [tutorials, setTutorials] = useState<TutorialListItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tutorialsResponse, statsResponse] = await Promise.all([
        tutorialApi.list({ limit: 50 }),
        analyticsApi.getDashboardStats(),
      ])

      setTutorials(tutorialsResponse.data)
      setStats(statsResponse.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total de Tutoriais</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_tutorials}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Publicados</div>
            <div className="text-3xl font-bold text-primary-600">{stats.published_tutorials}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Em Progresso</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.in_progress}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Concluídos</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </div>
      )}

      {/* Tutorials list */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Todos os Tutoriais</h2>

        {tutorials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
            Nenhum tutorial ainda. Crie seu primeiro tutorial para começar!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => navigate(`/tutorial/${tutorial.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold flex-1">{tutorial.title}</h3>
                    {tutorial.is_published && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Publicado
                      </span>
                    )}
                  </div>

                  {tutorial.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                  )}

                  {tutorial.category && (
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tutorial.category}
                      </span>
                    </div>
                  )}

                  {tutorial.tags && tutorial.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tutorial.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {tutorial.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{tutorial.tags.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {tutorial.step_count} passos
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(tutorial.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/tutorial/${tutorial.id}`)
                    }}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Ver Tutorial
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
