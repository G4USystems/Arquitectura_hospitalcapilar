import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hospital-capilar/shared/hooks'
import {
  getUserExperiments,
  createExperiment,
  deleteExperiment,
  getUserQuizzes,
  startExperiment,
  pauseExperiment,
} from '@hospital-capilar/shared/firebase'
import Header from '../../components/layout/Header'
import {
  Plus,
  MoreVertical,
  Trash2,
  FlaskConical,
  Play,
  Pause,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react'

export default function ExperimentsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [experiments, setExperiments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return

    try {
      const [experimentsData, quizzesData] = await Promise.all([
        getUserExperiments(user.uid),
        getUserQuizzes(user.uid),
      ])
      setExperiments(experimentsData)
      setQuizzes(quizzesData)
    } catch (error) {
      console.error('Error loading experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateExperiment() {
    if (!user || creating) return

    setCreating(true)
    try {
      const experiment = await createExperiment(user.uid, {
        name: 'Nuevo Experimento A/B',
      })
      navigate(`/experiments/${experiment.id}`)
    } catch (error) {
      console.error('Error creating experiment:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteExperiment(experimentId, e) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('¿Estás seguro de eliminar este experimento?')) return

    try {
      await deleteExperiment(experimentId)
      setExperiments(experiments.filter((e) => e.id !== experimentId))
    } catch (error) {
      console.error('Error deleting experiment:', error)
    }
    setMenuOpen(null)
  }

  async function handleToggleStatus(experiment, e) {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (experiment.status === 'running') {
        await pauseExperiment(experiment.id)
        setExperiments(
          experiments.map((exp) =>
            exp.id === experiment.id ? { ...exp, status: 'paused' } : exp
          )
        )
      } else if (experiment.status === 'draft' || experiment.status === 'paused') {
        await startExperiment(experiment.id)
        setExperiments(
          experiments.map((exp) =>
            exp.id === experiment.id ? { ...exp, status: 'running' } : exp
          )
        )
      }
    } catch (error) {
      console.error('Error toggling experiment status:', error)
    }
    setMenuOpen(null)
  }

  function getQuizName(quizId) {
    const quiz = quizzes.find((q) => q.id === quizId)
    return quiz?.name || 'Sin quiz'
  }

  const statusConfig = {
    draft: { label: 'Borrador', color: 'slate', icon: Clock },
    running: { label: 'En curso', color: 'green', icon: Play },
    paused: { label: 'Pausado', color: 'yellow', icon: Pause },
    completed: { label: 'Completado', color: 'blue', icon: CheckCircle },
  }

  return (
    <div>
      <Header
        title="Experimentos A/B"
        actions={
          <button
            onClick={handleCreateExperiment}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creando...' : 'Nuevo Experimento'}
          </button>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Crea tu primer experimento A/B
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Los experimentos te permiten comparar dos versiones de un quiz para ver cuál convierte mejor.
            </p>
            <button
              onClick={handleCreateExperiment}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Crear Experimento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment) => {
              const StatusIcon = statusConfig[experiment.status]?.icon || Clock
              const variantA = experiment.variants?.[0]
              const variantB = experiment.variants?.[1]
              const metricsA = experiment.metrics?.variantA || {}
              const metricsB = experiment.metrics?.variantB || {}

              return (
                <Link
                  key={experiment.id}
                  to={`/experiments/${experiment.id}`}
                  className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {experiment.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${
                              experiment.status === 'running'
                                ? 'bg-green-100 text-green-700'
                                : experiment.status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : experiment.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[experiment.status]?.label || 'Borrador'}
                          </span>
                          {experiment.winner && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                              Ganador: Variante {experiment.winner}
                            </span>
                          )}
                        </div>
                        {experiment.description && (
                          <p className="text-sm text-slate-500">
                            {experiment.description}
                          </p>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setMenuOpen(
                              menuOpen === experiment.id ? null : experiment.id
                            )
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>

                        {menuOpen === experiment.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                            {experiment.status !== 'completed' && (
                              <button
                                onClick={(e) => handleToggleStatus(experiment, e)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                {experiment.status === 'running' ? (
                                  <>
                                    <Pause className="w-4 h-4" />
                                    Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    Iniciar
                                  </>
                                )}
                              </button>
                            )}
                            <hr className="my-1" />
                            <button
                              onClick={(e) =>
                                handleDeleteExperiment(experiment.id, e)
                              }
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Variants Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Variant A */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Variante A (Control)
                          </span>
                          <span className="text-xs text-blue-600">
                            {variantA?.trafficPercent || 50}% tráfico
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2 truncate">
                          {getQuizName(variantA?.quizId)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {metricsA.visitors || 0} visitas
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {metricsA.visitors > 0
                              ? (
                                  ((metricsA.leads || 0) / metricsA.visitors) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>

                      {/* Variant B */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-purple-700">
                            Variante B
                          </span>
                          <span className="text-xs text-purple-600">
                            {variantB?.trafficPercent || 50}% tráfico
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2 truncate">
                          {getQuizName(variantB?.quizId)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {metricsB.visitors || 0} visitas
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {metricsB.visitors > 0
                              ? (
                                  ((metricsB.leads || 0) / metricsB.visitors) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
