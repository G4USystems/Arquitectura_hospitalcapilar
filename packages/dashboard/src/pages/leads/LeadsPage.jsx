import { useState, useEffect } from 'react'
import { useAuth } from '@hospital-capilar/shared/hooks'
import { getLeads, getUserQuizzes, updateLeadStatus } from '@hospital-capilar/shared/firebase'
import Header from '../../components/layout/Header'
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle,
  Clock,
  UserCheck,
} from 'lucide-react'

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => {
    loadData()
  }, [user, selectedQuiz])

  async function loadData() {
    if (!user) return

    try {
      const [leadsData, quizzesData] = await Promise.all([
        getLeads(user.uid, selectedQuiz !== 'all' ? { quizId: selectedQuiz } : {}),
        getUserQuizzes(user.uid),
      ])
      setLeads(leadsData)
      setQuizzes(quizzesData)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(leadId, newStatus) {
    try {
      await updateLeadStatus(leadId, newStatus)
      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))
    } catch (error) {
      console.error('Error updating status:', error)
    }
    setMenuOpen(null)
  }

  function exportToCSV() {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Quiz', 'Estado', 'Fecha']
    const rows = filteredLeads.map((lead) => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      quizzes.find((q) => q.id === lead.quizId)?.name || '',
      lead.status,
      lead.createdAt?.toDate?.()?.toLocaleDateString?.() || '',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.includes(query)
    )
  })

  const statusConfig = {
    new: { label: 'Nuevo', color: 'blue', icon: Clock },
    contacted: { label: 'Contactado', color: 'yellow', icon: UserCheck },
    converted: { label: 'Convertido', color: 'green', icon: CheckCircle },
  }

  return (
    <div>
      <Header
        title="Leads"
        actions={
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los quizzes</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No se encontraron resultados' : 'No hay leads todavía'}
            </h2>
            <p className="text-slate-500">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Los leads aparecerán aquí cuando alguien complete tu quiz'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Quiz
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const status = statusConfig[lead.status] || statusConfig.new
                  const StatusIcon = status.icon

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {lead.name || 'Sin nombre'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                              <Mail className="w-3.5 h-3.5" />
                              {lead.email}
                            </span>
                            {lead.phone && (
                              <span className="flex items-center gap-1 text-sm text-slate-500 hidden sm:flex">
                                <Phone className="w-3.5 h-3.5" />
                                {lead.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-slate-600">
                          {quizzes.find((q) => q.id === lead.quizId)?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-${status.color}-100 text-${status.color}-700`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-slate-500">
                          {lead.createdAt?.toDate?.()?.toLocaleDateString?.('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }) || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpen(menuOpen === lead.id ? null : lead.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                          </button>

                          {menuOpen === lead.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                  key={key}
                                  onClick={() => handleStatusChange(lead.id, key)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${
                                    lead.status === key ? 'text-blue-600' : 'text-slate-700'
                                  }`}
                                >
                                  <config.icon className="w-4 h-4" />
                                  Marcar como {config.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
