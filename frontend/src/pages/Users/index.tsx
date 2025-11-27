import { useState, useEffect } from 'react'
import { Users as UsersIcon, Plus, Trash2, Edit, Check, X, Key } from 'lucide-react'
import { userApi, tutorialApi, UserData } from '../../services/api'
import useAuthStore from '../../services/authStore'

interface Tutorial {
  id: string
  title: string
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([])
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [userTutorials, setUserTutorials] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user: currentUser } = useAuthStore()

  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    role: 'colaborador' as 'admin' | 'colaborador',
  })

  useEffect(() => {
    loadUsers()
    loadTutorials()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await userApi.list()
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTutorials = async () => {
    try {
      const response = await tutorialApi.list()
      setTutorials(response.data)
    } catch (error) {
      console.error('Erro ao carregar tutoriais:', error)
    }
  }

  const handleCreateUser = async () => {
    try {
      // Use the auth API register endpoint to create user
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')
      await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.token : ''}`
        },
        body: JSON.stringify(newUser)
      })

      setShowCreateModal(false)
      setNewUser({
        email: '',
        username: '',
        password: '',
        full_name: '',
        role: 'colaborador',
      })
      loadUsers()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao criar usuário')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await userApi.delete(userId)
      loadUsers()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao excluir usuário')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      await userApi.update(selectedUser.id!, {
        email: selectedUser.email,
        username: selectedUser.username,
        full_name: selectedUser.full_name,
        role: selectedUser.role,
        is_active: selectedUser.is_active,
      })
      setShowEditModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao atualizar usuário')
    }
  }

  const openAccessModal = async (user: UserData) => {
    setSelectedUser(user)
    try {
      const response = await userApi.getAccessibleTutorials(user.id!)
      setUserTutorials(response.data)
      setShowAccessModal(true)
    } catch (error) {
      console.error('Erro ao carregar tutoriais do usuário:', error)
    }
  }

  const toggleTutorialAccess = async (tutorialId: string) => {
    if (!selectedUser) return

    try {
      if (userTutorials.includes(tutorialId)) {
        await userApi.revokeTutorialAccess(selectedUser.id!, tutorialId)
        setUserTutorials(userTutorials.filter((id) => id !== tutorialId))
      } else {
        await userApi.grantTutorialAccess(selectedUser.id!, [tutorialId])
        setUserTutorials([...userTutorials, tutorialId])
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao atualizar acesso')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'colaborador':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'colaborador':
        return 'Colaborador'
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <UsersIcon className="w-7 h-7 mr-2" />
            Gerenciamento de Usuários
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie usuários e suas permissões de acesso aos tutoriais
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nome</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Função</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-gray-900">{user.full_name || user.username}</div>
                        <div className="text-gray-500">@{user.username}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.is_active ? (
                          <span className="text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Ativo
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <X className="w-4 h-4 mr-1" /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => openAccessModal(user)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          title="Gerenciar acesso aos tutoriais"
                        >
                          <Key className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome de usuário</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as 'admin' | 'colaborador' })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                <input
                  type="text"
                  value={selectedUser.full_name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value as 'admin' | 'instructor' | 'student' })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="student">Estudante</option>
                  <option value="instructor">Instrutor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUser.is_active}
                  onChange={(e) => setSelectedUser({ ...selectedUser, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Usuário ativo</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Access Modal */}
      {showAccessModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Gerenciar Acesso aos Tutoriais - {selectedUser.full_name || selectedUser.username}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecione os tutoriais que este usuário pode acessar
            </p>
            <div className="space-y-2">
              {tutorials.map((tutorial) => (
                <div key={tutorial.id} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={userTutorials.includes(tutorial.id)}
                    onChange={() => toggleTutorialAccess(tutorial.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-900">{tutorial.title}</label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowAccessModal(false)
                  setSelectedUser(null)
                  setUserTutorials([])
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
