import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from './api'

export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  role: 'admin' | 'colaborador'
  is_active: boolean
  created_at: string
  last_login?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: {
    email: string
    username: string
    password: string
    full_name?: string
    role?: 'admin' | 'colaborador'
  }) => Promise<void>
  setUser: (user: User) => void
  checkAuth: () => Promise<void>
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/api/auth/login', { email, password })
          const { access_token, user } = response.data

          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          })

          // Set token in axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true })
          await api.post('/api/auth/register', data)

          // After registration, automatically log in
          await get().login(data.email, data.password)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        delete api.defaults.headers.common['Authorization']
      },

      setUser: (user: User) => {
        set({ user })
      },

      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/api/auth/me')
          set({
            user: response.data,
            isAuthenticated: true,
          })
        } catch (error) {
          // Token is invalid or expired
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
