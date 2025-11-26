import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, CheckCircle, Maximize, Minimize } from 'lucide-react'
import { Step } from '@/services/api'
import { usePlayerStore } from '@/services/store'
import AnnotationOverlay from './AnnotationOverlay'

interface TutorialPlayerProps {
  steps: Step[]
  onClose: () => void
  onComplete?: () => void
}

const TutorialPlayer: React.FC<TutorialPlayerProps> = ({
  steps,
  onClose,
  onComplete,
}) => {
  const {
    currentStepIndex,
    completedSteps,
    nextStep,
    previousStep,
    markStepCompleted,
    setCurrentStepIndex,
  } = usePlayerStore()

  const playerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMouseMoveRef = useRef<number>(0)

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  useEffect(() => {
    // Reset to first step on mount
    setCurrentStepIndex(0)
  }, [])

  // Auto-hide controls in fullscreen
  const handleMouseMove = () => {
    if (!isFullscreen) return

    // Debounce: only process mouse move if at least 200ms have passed
    const now = Date.now()
    if (now - lastMouseMoveRef.current < 200) return
    lastMouseMoveRef.current = now

    setShowControls(true)

    // Clear existing timeout
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }

    // Set new timeout to hide controls after 10 seconds
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 10000)
  }

  useEffect(() => {
    // Show controls when not in fullscreen
    if (!isFullscreen) {
      setShowControls(true)
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [isFullscreen])

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!playerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Erro ao alternar tela cheia:', err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleNext = () => {
    markStepCompleted(currentStepIndex)

    if (isLastStep) {
      if (onComplete) onComplete()
    } else {
      nextStep()
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      previousStep()
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'Escape') {
      if (isFullscreen) {
        document.exitFullscreen()
      } else {
        onClose()
      }
    }
    if (e.key === 'f' || e.key === 'F') toggleFullscreen()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStepIndex, isFullscreen])

  if (!currentStep) return null

  return (
    <div
      ref={playerRef}
      className={`fixed inset-0 z-50 bg-black flex flex-col ${
        isFullscreen && !showControls ? 'cursor-none' : ''
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Header with progress */}
      <motion.div
        className="bg-gray-900 text-white p-4 flex items-center justify-between"
        initial={{ y: 0 }}
        animate={{ y: isFullscreen && !showControls ? -100 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-1">
            Passo {currentStepIndex + 1} de {steps.length}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            />
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title="Fechar (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className={`flex-1 flex items-center justify-center overflow-auto ${isFullscreen ? 'pt-24 px-8 pb-8' : 'p-8'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="max-w-6xl w-full"
          >
            <h2 className="text-3xl font-bold text-white mb-6">{currentStep.title}</h2>

            {/* Video */}
            {currentStep.video_url && (
              <div className="mb-6 bg-black rounded-lg overflow-hidden shadow-2xl max-w-5xl mx-auto">
                <video
                  src={currentStep.video_url}
                  controls
                  className="w-full h-auto max-h-[70vh] object-contain"
                  key={currentStepIndex}
                  controlsList="nodownload"
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            )}

            {/* Screenshot with annotations */}
            {currentStep.screenshot_url && !currentStep.video_url && (
              <div className="relative mb-6 bg-white rounded-lg overflow-hidden shadow-2xl max-w-5xl mx-auto">
                <img
                  src={currentStep.screenshot_url}
                  alt={currentStep.title}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
                <AnnotationOverlay annotations={currentStep.annotations} />
              </div>
            )}

            {/* Content */}
            {currentStep.content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="bg-white rounded-lg p-6 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: currentStep.content }}
              />
            )}

            {/* Completion indicator */}
            {completedSteps.includes(currentStepIndex) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 flex items-center gap-2 text-green-400"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Passo concluído</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <motion.div
        className="bg-gray-900 text-white p-6 flex items-center justify-between"
        initial={{ y: 0 }}
        animate={{ y: isFullscreen && !showControls ? 100 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-400">Use as setas para navegar • F para tela cheia</div>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          {isLastStep ? 'Concluir' : 'Próximo'}
          {!isLastStep && <ChevronRight className="w-5 h-5" />}
        </button>
      </motion.div>
    </div>
  )
}

export default TutorialPlayer
