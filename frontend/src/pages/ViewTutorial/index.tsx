import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Edit, ArrowLeft } from 'lucide-react'
import { tutorialApi, Tutorial } from '@/services/api'
import TutorialPlayer from '@/components/Player/TutorialPlayer'

const ViewTutorial: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tutorial, setTutorial] = useState<Tutorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (id) {
      loadTutorial(id)
    }
  }, [id])

  const loadTutorial = async (tutorialId: string) => {
    try {
      const response = await tutorialApi.get(tutorialId)
      setTutorial(response.data)
    } catch (error) {
      console.error('Error loading tutorial:', error)
      alert('Failed to load tutorial')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading tutorial...</div>
      </div>
    )
  }

  if (!tutorial) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Tutorial not found</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{tutorial.title}</h1>
                {tutorial.description && (
                  <p className="text-gray-600 text-lg">{tutorial.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-tutorial/${id}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <Edit className="w-5 h-5" />
                  Editar
                </button>
                <button
                  onClick={() => setPlaying(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Tutorial
                </button>
              </div>
            </div>

            {tutorial.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tutorial.category}
                </span>
              </div>
            )}

            {tutorial.tags && tutorial.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tutorial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                Steps ({tutorial.steps.length})
              </h2>

              <div className="space-y-4">
                {tutorial.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                        {step.video_url && (
                          <video
                            src={step.video_url}
                            controls
                            className="w-full max-w-3xl h-auto max-h-96 object-contain rounded-lg shadow-sm mb-2"
                            controlsList="nodownload"
                          >
                            Seu navegador não suporta o elemento de vídeo.
                          </video>
                        )}
                        {step.screenshot_url && !step.video_url && (
                          <img
                            src={step.screenshot_url}
                            alt={step.title}
                            className="w-full max-w-3xl h-auto max-h-96 object-contain rounded-lg shadow-sm mb-2"
                          />
                        )}
                        {step.content && (
                          <div
                            className="prose max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{ __html: step.content }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {playing && (
        <TutorialPlayer
          steps={tutorial.steps}
          onClose={() => setPlaying(false)}
          onComplete={() => {
            setPlaying(false)
            alert('Tutorial completo! Parabéns!🎉')
          }}
        />
      )}
    </>
  )
}

export default ViewTutorial
