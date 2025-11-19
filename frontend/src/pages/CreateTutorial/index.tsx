import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Save, Trash2 } from 'lucide-react'
import ScreenshotUpload from '@/components/Editor/ScreenshotUpload'
import VideoUpload from '@/components/Editor/VideoUpload'
import ImageAnnotator from '@/components/Editor/ImageAnnotator'
import RichTextEditor from '@/components/Editor/RichTextEditor'
import { tutorialApi, Step, Annotation } from '@/services/api'

const CreateTutorial: React.FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  const currentStep = steps[currentStepIndex]

  const addStep = () => {
    const newStep: Step = {
      order: steps.length + 1,
      title: `Step ${steps.length + 1}`,
      annotations: [],
    }
    setSteps([...steps, newStep])
    setCurrentStepIndex(steps.length)
  }

  const updateCurrentStep = (updates: Partial<Step>) => {
    const updatedSteps = [...steps]
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      ...updates,
    }
    setSteps(updatedSteps)
  }

  const deleteStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index)
    setSteps(updatedSteps)
    if (currentStepIndex >= updatedSteps.length) {
      setCurrentStepIndex(Math.max(0, updatedSteps.length - 1))
    }
  }

  const handleAddTag = (e?: React.KeyboardEvent) => {
    e?.preventDefault()
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const saveTutorial = async () => {
    if (!title) {
      alert('Please enter a tutorial title')
      return
    }

    setSaving(true)

    try {
      const tutorialData = {
        title,
        description,
        category,
        tags,
        steps: steps.map((step, index) => ({
          ...step,
          order: index + 1,
        })),
      }

      const response = await tutorialApi.create(tutorialData)

      if (!response.data.id) {
        console.error('Backend não retornou um ID válido')
        alert('Tutorial salvo, mas houve um problema ao redirecionar. Por favor, volte ao Dashboard.')
        navigate('/')
        return
      }

      alert('Tutorial criado com sucesso!')
      navigate(`/tutorial/${response.data.id}`)
    } catch (error: any) {
      console.error('Erro ao criar o tutorial:', error)
      alert('Falha ao criar tutorial: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Criar Tutorial</h1>
        <button
          onClick={saveTutorial}
          disabled={saving || !title}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Tutorial'}
        </button>
      </div>

      {/* Tutorial metadata */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Coloque o título do tutorial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Coloque a descrição do tutorial"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Software, Training, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e)
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Adicione uma tag e pressione Enter"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-primary-900">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Steps section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Steps sidebar */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Passos</h3>
            <button
              onClick={addStep}
              className="p-1 text-primary-500 hover:bg-primary-50 rounded"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-3 rounded cursor-pointer flex items-center justify-between ${
                  currentStepIndex === index ? 'bg-primary-50 border border-primary-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentStepIndex(index)}
              >
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Passo {index + 1}</div>
                  <div className="font-medium truncate">{step.title}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteStep(index)
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {steps.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                Nenhum passo ainda. Clique + para adicionar um.
              </div>
            )}
          </div>
        </div>

        {/* Step editor */}
        <div className="col-span-9 space-y-4">
          {currentStep ? (
            <>
              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <input
                  type="text"
                  value={currentStep.title}
                  onChange={(e) => updateCurrentStep({ title: e.target.value })}
                  className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-primary-500 focus:ring-0 px-0"
                  placeholder="Título do passo"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot</label>
                    <ScreenshotUpload
                      currentImage={currentStep.screenshot_url}
                      onUploadSuccess={(url) => updateCurrentStep({ screenshot_url: url, video_url: undefined })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video (alternativa ao screenshot)
                    </label>
                    <VideoUpload
                      currentVideo={currentStep.video_url}
                      onUploadSuccess={(url) => updateCurrentStep({ video_url: url, screenshot_url: undefined })}
                    />
                  </div>
                </div>

                {currentStep.screenshot_url && !currentStep.video_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adicionar Anotações
                    </label>
                    <ImageAnnotator
                      imageUrl={`http://localhost:8000${currentStep.screenshot_url}`}
                      annotations={currentStep.annotations}
                      onAnnotationsChange={(annotations) =>
                        updateCurrentStep({ annotations })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruções
                  </label>
                  <RichTextEditor
                    content={currentStep.content}
                    onChange={(content) => updateCurrentStep({ content })}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow text-center text-gray-400">
              Adicione um passo para começar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTutorial
