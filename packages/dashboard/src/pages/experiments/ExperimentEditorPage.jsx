import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@hospital-capilar/shared/hooks'
import {
  getExperiment,
  updateExperiment,
  getUserQuizzes,
  startExperiment,
  pauseExperiment,
  completeExperiment,
} from '@hospital-capilar/shared/firebase'
import Header from '../../components/layout/Header'
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  CheckCircle,
  FileQuestion,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Target,
  Award,
  ChevronDown,
} from 'lucide-react'

export default function ExperimentEditorPage() {
  const { experimentId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [experiment, setExperiment] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variantAQuizId, setVariantAQuizId] = useState('')
  const [variantBQuizId, setVariantBQuizId] = useState('')
  const [trafficSplit, setTrafficSplit] = useState(50)

  useEffect(() => {
    loadData()
  }, [experimentId, user])

  async function loadData() {
    if (!user || !experimentId) return

    try {
      const [experimentData, quizzesData] = await Promise.all([
        getExperiment(experimentId),
        getUserQuizzes(user.uid),
      ])

      if (!experimentData) {
        navigate('/experiments')
        return
      }

      setExperiment(experimentData)
      setQuizzes(quizzesData)
      setName(experimentData.name || '')
      setDescription(experimentData.description || '')
      setVariantAQuizId(experimentData.variants?.[0]?.quizId || '')
      setVariantBQuizId(experimentData.variants?.[1]?.quizId || '')
      setTrafficSplit(experimentData.variants?.[0]?.trafficPercent || 50)

      // If campaignId in URL, pre-fill
      const campaignId = searchParams.get('campaignId')
      if (campaignId && !experimentData.campaignId) {
        // Could pre-fill campaign quizzes here
      }
    } catch (error) {
      console.error('Error loading experiment:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!experiment) return

    setSaving(true)
    try {
      await updateExperiment(experimentId, {
        name,
        description,
        variants: [
          {
            id: 'A',
            name: 'Variante A (Control)',
            quizId: variantAQuizId || null,
            trafficPercent: trafficSplit,
          },
          {
            id: 'B',
            name: 'Variante B',
            quizId: variantBQuizId || null,
            trafficPercent: 100 - trafficSplit,
          },
        ],
      })
      setExperiment({
        ...experiment,
        name,
        description,
        variants: [
          { id: 'A', name: 'Variante A (Control)', quizId: variantAQuizId, trafficPercent: trafficSplit },
          { id: 'B', name: 'Variante B', quizId: variantBQuizId, trafficPercent: 100 - trafficSplit },
        ],
      })
    } catch (error) {
      console.error('Error saving experiment:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleStart() {
    if (!variantAQuizId || !variantBQuizId) {
      alert('Debes seleccionar un quiz para cada variante')
      return
    }

    try {
      await handleSave()
      await startExperiment(experimentId)
      setExperiment({ ...experiment, status: 'running' })
    } catch (error) {
      console.error('Error starting experiment:', error)
    }
  }

  async function handlePause() {
    try {
      await pauseExperiment(experimentId)
      setExperiment({ ...experiment, status: 'paused' })
    } catch (error) {
      console.error('Error pausing experiment:', error)
    }
  }

  async function handleComplete(winner) {
    if (!confirm(`¿Estás seguro de declarar la Variante ${winner} como ganadora?`)) return

    try {
      await completeExperiment(experimentId, winner)
      setExperiment({ ...experiment, status: 'completed', winner })
    } catch (error) {
      console.error('Error completing experiment:', error)
    }
  }

  function getQuizName(quizId) {
    const quiz = quizzes.find((q) => q.id === quizId)
    return quiz?.name || 'Seleccionar quiz...'
  }

  const metricsA = experiment?.metrics?.variantA || {}
  const metricsB = experiment?.metrics?.variantB || {}

  // Calculate conversion rates
  const conversionA = metricsA.visitors > 0 ? (metricsA.leads / metricsA.visitors) * 100 : 0
  const conversionB = metricsB.visitors > 0 ? (metricsB.leads / metricsB.visitors) * 100 : 0
  const conversionDiff = conversionB - conversionA
  const isAWinning = conversionA > conversionB
  const isBWinning = conversionB > conversionA

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const isRunning = experiment?.status === 'running'
  const isCompleted = experiment?.status === 'completed'
  const canEdit = !isRunning && !isCompleted

  return (
    <div>
      <Header
        title={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/experiments')}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              className="text-xl font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full disabled:opacity-75"
              placeholder="Nombre del experimento"
            />
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {experiment?.status === 'draft' && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Iniciar Experimento
                </button>
              </>
            )}
            {experiment?.status === 'running' && (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
            )}
            {experiment?.status === 'paused' && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Reanudar
              </button>
            )}
            {isCompleted && experiment?.winner && (
              <span className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg">
                <Award className="w-4 h-4" />
                Ganador: Variante {experiment.winner}
              </span>
            )}
          </div>
        }
      />

      <div className="p-6">
        {/* Status Banner */}
        {isRunning && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-800 font-medium">
              Experimento en curso - Recolectando datos...
            </span>
          </div>
        )}

        {/* Variants Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Variant A */}
          <div className={`bg-white rounded-xl border-2 p-6 ${isAWinning && (isRunning || isCompleted) ? 'border-green-300' : 'border-blue-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Variante A (Control)</h3>
                  <p className="text-sm text-slate-500">{trafficSplit}% del tráfico</p>
                </div>
              </div>
              {isAWinning && (isRunning || isCompleted) && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Ganando
                </span>
              )}
            </div>

            {/* Quiz Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quiz
              </label>
              <div className="relative">
                <select
                  value={variantAQuizId}
                  onChange={(e) => setVariantAQuizId(e.target.value)}
                  disabled={!canEdit}
                  className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar quiz...</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Metrics */}
            {(isRunning || isCompleted) && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    Visitantes
                  </div>
                  <p className="text-lg font-bold text-slate-900">{metricsA.visitors || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    Leads
                  </div>
                  <p className="text-lg font-bold text-slate-900">{metricsA.leads || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Target className="w-3.5 h-3.5" />
                    Tasa de Conversión
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{conversionA.toFixed(2)}%</p>
                </div>
              </div>
            )}

            {/* Declare Winner Button */}
            {isRunning && metricsA.visitors > 0 && (
              <button
                onClick={() => handleComplete('A')}
                className="w-full mt-4 px-4 py-2 border border-blue-200 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Declarar Ganador
              </button>
            )}
          </div>

          {/* Variant B */}
          <div className={`bg-white rounded-xl border-2 p-6 ${isBWinning && (isRunning || isCompleted) ? 'border-green-300' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="font-bold text-purple-700">B</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Variante B</h3>
                  <p className="text-sm text-slate-500">{100 - trafficSplit}% del tráfico</p>
                </div>
              </div>
              {isBWinning && (isRunning || isCompleted) && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Ganando
                </span>
              )}
            </div>

            {/* Quiz Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quiz
              </label>
              <div className="relative">
                <select
                  value={variantBQuizId}
                  onChange={(e) => setVariantBQuizId(e.target.value)}
                  disabled={!canEdit}
                  className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar quiz...</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Metrics */}
            {(isRunning || isCompleted) && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    Visitantes
                  </div>
                  <p className="text-lg font-bold text-slate-900">{metricsB.visitors || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    Leads
                  </div>
                  <p className="text-lg font-bold text-slate-900">{metricsB.leads || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Target className="w-3.5 h-3.5" />
                    Tasa de Conversión
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-slate-900">{conversionB.toFixed(2)}%</p>
                    {conversionDiff !== 0 && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${conversionDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {conversionDiff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {conversionDiff > 0 ? '+' : ''}{conversionDiff.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Declare Winner Button */}
            {isRunning && metricsB.visitors > 0 && (
              <button
                onClick={() => handleComplete('B')}
                className="w-full mt-4 px-4 py-2 border border-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
              >
                Declarar Ganador
              </button>
            )}
          </div>
        </div>

        {/* Traffic Split Slider */}
        {canEdit && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">División del Tráfico</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700 w-16">A: {trafficSplit}%</span>
              <input
                type="range"
                min="10"
                max="90"
                value={trafficSplit}
                onChange={(e) => setTrafficSplit(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-medium text-purple-700 w-16 text-right">B: {100 - trafficSplit}%</span>
            </div>
            <div className="mt-4 h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${trafficSplit}%` }}
              />
              <div
                className="bg-purple-500 transition-all"
                style={{ width: `${100 - trafficSplit}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {canEdit && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Descripción del Experimento</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe qué estás probando en este experimento..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Results Summary */}
        {isCompleted && experiment?.winner && (
          <div className="mt-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Experimento Completado</h3>
                <p className="text-white/80">
                  La Variante {experiment.winner} ganó con una tasa de conversión de{' '}
                  <strong>{experiment.winner === 'A' ? conversionA.toFixed(2) : conversionB.toFixed(2)}%</strong>
                  {' '}({Math.abs(conversionDiff).toFixed(2)}% {experiment.winner === 'B' ? 'mejor' : 'peor'} que la otra variante)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
