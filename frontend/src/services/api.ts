import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const { token } = JSON.parse(authStorage).state
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface Annotation {
  id?: string
  step_id?: string
  type: 'arrow' | 'box' | 'tooltip' | 'highlight'
  coordinates: {
    x: number
    y: number
    width?: number
    height?: number
    points?: { x: number; y: number }[]
  }
  text?: string
  animation?: 'fadeIn' | 'slideIn' | 'bounce'
  delay?: number
  style?: Record<string, any>
}

export interface Step {
  id?: string
  tutorial_id?: string
  order: number
  title: string
  screenshot_url?: string
  video_url?: string
  content?: string
  validation_required?: boolean
  validation_type?: 'click' | 'input' | 'selection'
  validation_target?: string
  created_at?: string
  annotations: Annotation[]
}

export interface Tutorial {
  id?: string
  title: string
  description?: string
  category?: string
  tags: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
  is_published?: boolean
  version?: number
  steps: Step[]
}

export interface Progress {
  id?: string
  user_id?: string
  tutorial_id: string
  current_step: number
  completed_steps: number[]
  time_per_step: Record<string, number>
  attempts: number
  completed: boolean
  score: number
  started_at?: string
  completed_at?: string
  last_accessed?: string
}

// Tutorial endpoints
export const tutorialApi = {
  create: (tutorial: Tutorial) => api.post('/api/tutorials/', tutorial),
  list: (params?: { skip?: number; limit?: number; category?: string; published_only?: boolean }) =>
    api.get('/api/tutorials/', { params }),
  get: (id: string) => api.get(`/api/tutorials/${id}`),
  update: (id: string, data: Partial<Tutorial>) => api.put(`/api/tutorials/${id}`, data),
  delete: (id: string) => api.delete(`/api/tutorials/${id}`),
  addStep: (tutorialId: string, step: Step) => api.post(`/api/tutorials/${tutorialId}/steps`, step),
  updateStep: (tutorialId: string, stepId: string, data: Partial<Step>) =>
    api.put(`/api/tutorials/${tutorialId}/steps/${stepId}`, data),
  deleteStep: (tutorialId: string, stepId: string) =>
    api.delete(`/api/tutorials/${tutorialId}/steps/${stepId}`),
}

// Upload endpoints
export const uploadApi = {
  uploadScreenshot: (file: File, tutorialTitle?: string, stepOrder?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    if (tutorialTitle) formData.append('tutorial_title', tutorialTitle)
    if (stepOrder !== undefined) formData.append('step_order', stepOrder.toString())
    return api.post('/api/upload/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteScreenshot: (filename: string) => api.delete(`/api/upload/screenshot/${filename}`),
  uploadVideo: (file: File, tutorialTitle?: string, stepOrder?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    if (tutorialTitle) formData.append('tutorial_title', tutorialTitle)
    if (stepOrder !== undefined) formData.append('step_order', stepOrder.toString())
    return api.post('/api/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteVideo: (filename: string) => api.delete(`/api/upload/video/${filename}`),
}

// Progress/Analytics endpoints
export const analyticsApi = {
  createProgress: (tutorialId: string) => api.post('/api/analytics/progress', { tutorial_id: tutorialId }),
  getProgress: (tutorialId: string) => api.get(`/api/analytics/progress/${tutorialId}`),
  updateProgress: (progressId: string, data: Partial<Progress>) =>
    api.put(`/api/analytics/progress/${progressId}`, data),
  getTutorialStats: (tutorialId: string) => api.get(`/api/analytics/tutorials/${tutorialId}/stats`),
  getDashboardStats: () => api.get('/api/analytics/dashboard'),
}

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (data: {
    email: string
    username: string
    password: string
    full_name?: string
    role?: string
  }) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}

// User management endpoints
export interface UserData {
  id?: string
  email: string
  username: string
  full_name?: string
  role: 'admin' | 'instructor' | 'student'
  is_active?: boolean
  created_at?: string
  last_login?: string
}

export const userApi = {
  list: (params?: { skip?: number; limit?: number }) => api.get('/api/users/', { params }),
  get: (userId: string) => api.get(`/api/users/${userId}`),
  update: (userId: string, data: Partial<UserData>) => api.put(`/api/users/${userId}`, data),
  delete: (userId: string) => api.delete(`/api/users/${userId}`),
  changePassword: (userId: string, currentPassword: string, newPassword: string) =>
    api.post(`/api/users/${userId}/password`, { current_password: currentPassword, new_password: newPassword }),
  grantTutorialAccess: (userId: string, tutorialIds: string[]) =>
    api.post(`/api/users/${userId}/tutorials/access`, { user_id: userId, tutorial_ids: tutorialIds }),
  revokeTutorialAccess: (userId: string, tutorialId: string) =>
    api.delete(`/api/users/${userId}/tutorials/${tutorialId}/access`),
  getAccessibleTutorials: (userId: string) => api.get(`/api/users/${userId}/tutorials`),
}

export default api
