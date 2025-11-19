import React from 'react'
import { CheckCircle, Clock, Trophy } from 'lucide-react'

const StudentProgress: React.FC = () => {
  // This is a placeholder - in a real app, you'd fetch actual progress data

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu Progresso</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="text-gray-500 text-sm">Concluídos</div>
          </div>
          <div className="text-3xl font-bold">0</div>
          <div className="text-sm text-gray-500 mt-1">Tutoriais finalizados</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="text-gray-500 text-sm">Em Andamento</div>
          </div>
          <div className="text-3xl font-bold">0</div>
          <div className="text-sm text-gray-500 mt-1">Aprendendo atualmente</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary-500" />
            <div className="text-gray-500 text-sm">Pontuação Média</div>
          </div>
          <div className="text-3xl font-bold">-</div>
          <div className="text-sm text-gray-500 mt-1">Desempenho geral</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
        <p>Nenhum dado de progresso ainda.</p>
        <p className="mt-2">Inicie um tutorial para começar a acompanhar seu progresso!</p>
      </div>
    </div>
  )
}

export default StudentProgress
