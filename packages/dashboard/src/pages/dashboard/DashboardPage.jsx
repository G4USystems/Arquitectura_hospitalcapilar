import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@hospital-capilar/shared/hooks'
import { getUserQuizzes, getLeads } from '@hospital-capilar/shared/firebase'
import { seedHospitalCapilarQuiz } from '../../scripts/seedHospitalCapilarQuiz'
import Header from '../../components/layout/Header'
import {
  FileQuestion,
  Users,
  TrendingUp,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react'

export default function DashboardPage() {
  const { user, userData } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const hasSeeded = useRef(false)

  useEffect(() => {
    async function loadDataAndSeed() {
      if (!user) return

      try {
        // Load quizzes first
        let quizzesData = await getUserQuizzes(user.uid)

        // If no quizzes and haven't seeded yet, create Hospital Capilar quiz automatically
        if (quizzesData.length === 0 && !hasSeeded.current) {
          hasSeeded.current = true
          console.log('No quizzes found, creating Hospital Capilar quiz...')
          await seedHospitalCapilarQuiz(user.uid)
          // Reload quizzes after seeding
          quizzesData = await getUserQuizzes(user.uid)
        }

        const leadsData = await getLeads(user.uid, { limit: 5 })
        setQuizzes(quizzesData)
        setLeads(leadsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDataAndSeed()
  }, [user])

  // Calculate stats
  const totalViews = quizzes.reduce((sum, q) => sum + (q.stats?.totalViews || 0), 0)
  const totalLeads = quizzes.reduce((sum, q) => sum + (q.stats?.totalLeads || 0), 0)
  const avgConversion = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : 0

  const stats = [
    { name: 'Total Quizzes', value: quizzes.length, icon: FileQuestion, color: 'blue' },
    { name: 'Total Leads', value: totalLeads, icon: Users, color: 'green' },
    { name: 'Total Vistas', value: totalViews, icon: Eye, color: 'purple' },
    { name: 'Conversión', value: `${avgConversion}%`, icon: TrendingUp, color: 'orange' },
  ]

  return (
    <div>
      <Header
        title={`Hola, ${userData?.displayName || 'Usuario'}`}
        actions={
          <Link
            to="/quizzes"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Quiz
          </Link>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white rounded-xl p-6 border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.name}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Quizzes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Mis Quizzes</h2>
                  <Link
                    to="/quizzes"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Ver todos <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {quizzes.length === 0 ? (
                    <div className="p-6 text-center">
                      <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">No tienes quizzes todavía</p>
                      <Link
                        to="/quizzes"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Crear mi primer quiz
                      </Link>
                    </div>
                  ) : (
                    quizzes.slice(0, 5).map((quiz) => (
                      <Link
                        key={quiz.id}
                        to={`/quizzes/${quiz.id}`}
                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{quiz.name}</p>
                          <p className="text-sm text-slate-500">
                            {quiz.stats?.totalLeads || 0} leads • {quiz.stats?.totalViews || 0} vistas
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            quiz.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {quiz.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Leads */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Últimos Leads</h2>
                  <Link
                    to="/leads"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Ver todos <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {leads.length === 0 ? (
                    <div className="p-6 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No hay leads todavía</p>
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{lead.name || 'Sin nombre'}</p>
                          <p className="text-sm text-slate-500">{lead.email}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'new'
                              ? 'bg-blue-100 text-blue-700'
                              : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {lead.status === 'new' ? 'Nuevo' : lead.status === 'contacted' ? 'Contactado' : 'Convertido'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
