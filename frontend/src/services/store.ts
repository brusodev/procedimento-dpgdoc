import { create } from 'zustand'
import { Tutorial, Step, Annotation } from './api'

interface EditorState {
  currentTutorial: Tutorial | null
  currentStep: Step | null
  selectedAnnotation: Annotation | null
  setCurrentTutorial: (tutorial: Tutorial | null) => void
  setCurrentStep: (step: Step | null) => void
  setSelectedAnnotation: (annotation: Annotation | null) => void
  addStep: (step: Step) => void
  updateStep: (stepId: string, updates: Partial<Step>) => void
  deleteStep: (stepId: string) => void
  addAnnotation: (stepId: string, annotation: Annotation) => void
  updateAnnotation: (stepId: string, annotationId: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (stepId: string, annotationId: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  currentTutorial: null,
  currentStep: null,
  selectedAnnotation: null,

  setCurrentTutorial: (tutorial) => set({ currentTutorial: tutorial }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedAnnotation: (annotation) => set({ selectedAnnotation: annotation }),

  addStep: (step) =>
    set((state) => {
      if (!state.currentTutorial) return state
      return {
        currentTutorial: {
          ...state.currentTutorial,
          steps: [...state.currentTutorial.steps, step],
        },
      }
    }),

  updateStep: (stepId, updates) =>
    set((state) => {
      if (!state.currentTutorial) return state
      return {
        currentTutorial: {
          ...state.currentTutorial,
          steps: state.currentTutorial.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        },
      }
    }),

  deleteStep: (stepId) =>
    set((state) => {
      if (!state.currentTutorial) return state
      return {
        currentTutorial: {
          ...state.currentTutorial,
          steps: state.currentTutorial.steps.filter((step) => step.id !== stepId),
        },
      }
    }),

  addAnnotation: (stepId, annotation) =>
    set((state) => {
      if (!state.currentTutorial) return state
      return {
        currentTutorial: {
          ...state.currentTutorial,
          steps: state.currentTutorial.steps.map((step) =>
            step.id === stepId
              ? { ...step, annotations: [...step.annotations, annotation] }
              : step
          ),
        },
      }
    }),

  updateAnnotation: (stepId, annotationId, updates) =>
    set((state) => {
      if (!state.currentTutorial) return state
      return {
        currentTutorial: {
          ...state.currentTutorial,
          steps: state.currentTutorial.steps.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  annotations: step.annotations.map((ann) =>
                    ann.id === annotationId ? { ...ann, ...updates } : ann
                  ),
                }
              : step
          ),
        },
      }
    }),

  deleteAnnotation: (stepId, annotationId) =>
    set((state) => {
      if (!state.currentTutorial) return state
      return {
        currentTutorial: {
          ...state.currentTutorial,
          steps: state.currentTutorial.steps.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  annotations: step.annotations.filter((ann) => ann.id !== annotationId),
                }
              : step
          ),
        },
      }
    }),
}))


interface PlayerState {
  currentStepIndex: number
  isPlaying: boolean
  completedSteps: number[]
  startTime: number | null
  stepStartTime: number | null
  setCurrentStepIndex: (index: number) => void
  setIsPlaying: (playing: boolean) => void
  markStepCompleted: (stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStepIndex: 0,
  isPlaying: false,
  completedSteps: [],
  startTime: null,
  stepStartTime: null,

  setCurrentStepIndex: (index) =>
    set({
      currentStepIndex: index,
      stepStartTime: Date.now(),
    }),

  setIsPlaying: (playing) =>
    set({
      isPlaying: playing,
      startTime: playing ? Date.now() : null,
    }),

  markStepCompleted: (stepIndex) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(stepIndex)
        ? state.completedSteps
        : [...state.completedSteps, stepIndex],
    })),

  nextStep: () =>
    set((state) => ({
      currentStepIndex: state.currentStepIndex + 1,
      stepStartTime: Date.now(),
    })),

  previousStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
      stepStartTime: Date.now(),
    })),

  reset: () =>
    set({
      currentStepIndex: 0,
      isPlaying: false,
      completedSteps: [],
      startTime: null,
      stepStartTime: null,
    }),
}))
