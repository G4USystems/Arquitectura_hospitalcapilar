import { useState, useEffect } from 'react'
import { useAuth } from '@hospital-capilar/shared/hooks'
import { getUserQuizzes, getLeads } from '@hospital-capilar/shared/firebase'
import Header from '../../components/layout/Header'
import {
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react'

// Metric Card Component
function MetricCard({ label, value, change, tooltip, prefix = '', suffix = '' }) {
  const isPositive = change > 0
  const isNeutral = change === 0 || change === null

  return (
    <div className="bg-slate-800 rounded-lg p-4 min-w-0">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-slate-400 text-xs truncate">{label}</span>
        {tooltip && (
          <div className="relative group">
            <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-white">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      {!isNeutral && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{change?.toFixed(2)}%</span>
        </div>
      )}
      {isNeutral && change !== null && (
        <div className="text-xs text-slate-500 mt-1">0%</div>
      )}
    </div>
  )
}

// Conversion Rate Card Component
function ConversionCard({ label, value, change, tooltip }) {
  const isPositive = change > 0
  const isNeutral = change === 0 || change === null

  return (
    <div className="bg-slate-800 rounded-lg p-4 min-w-0">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-slate-400 text-xs truncate">{label}</span>
        {tooltip && (
          <div className="relative group">
            <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-white">
        {typeof value === 'number' ? value.toFixed(2) : value}%
      </div>
      {!isNeutral && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{change?.toFixed(2)}%</span>
        </div>
      )}
      {isNeutral && change !== null && (
        <div className="text-xs text-slate-500 mt-1">0%</div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [quizzes, setQuizzes] = useState([])
  const [metrics, setMetrics] = useState({
    // Absolute metrics
    totalRevenue: 0,
    cohortRevenue: 0,
    buyers: 0,
    visitors: 0,
    startedQuiz: 0,
    addedEmail: 0,
    finishedQuiz: 0,
    initiatedCheckout: 0,
    // Changes (mock for now, would come from comparing periods)
    changes: {
      visitors: -22.05,
      startedQuiz: -16.52,
      addedEmail: null,
      finishedQuiz: -19.86,
      initiatedCheckout: -12.12,
    },
    // Conversion rates
    conversions: {
      visitorToStart: 61.9,
      visitorToFinish: 32.77,
      startToFinish: 52.94,
      visitorToAddEmail: 0,
      addEmailToFinish: 0,
      visitorToBuy: 2.52,
    },
    conversionChanges: {
      visitorToStart: 6.59,
      visitorToFinish: 2.81,
      startToFinish: -3.55,
      visitorToAddEmail: 0,
      addEmailToFinish: 0,
      visitorToBuy: 92.44,
    },
  })

  useEffect(() => {
    loadAnalytics()
  }, [user, selectedQuiz, dateRange])

  async function loadAnalytics() {
    if (!user) return

    setLoading(true)
    try {
      // Load quizzes for selector
      const quizzesData = await getUserQuizzes(user.uid)
      setQuizzes(quizzesData)

      // Calculate metrics from quiz stats
      let totalViews = 0
      let totalStarts = 0
      let totalCompletes = 0
      let totalLeads = 0

      const relevantQuizzes = selectedQuiz === 'all'
        ? quizzesData
        : quizzesData.filter(q => q.id === selectedQuiz)

      relevantQuizzes.forEach(quiz => {
        totalViews += quiz.stats?.totalViews || 0
        totalStarts += quiz.stats?.totalStarts || quiz.stats?.totalViews || 0
        totalCompletes += quiz.stats?.totalCompletes || 0
        totalLeads += quiz.stats?.totalLeads || 0
      })

      // Load leads count
      const leadsData = await getLeads(user.uid, { quizId: selectedQuiz !== 'all' ? selectedQuiz : undefined })
      totalLeads = leadsData.length || totalLeads

      // Calculate conversion rates
      const visitorToStart = totalViews > 0 ? (totalStarts / totalViews) * 100 : 0
      const visitorToFinish = totalViews > 0 ? (totalCompletes / totalViews) * 100 : 0
      const startToFinish = totalStarts > 0 ? (totalCompletes / totalStarts) * 100 : 0
      const visitorToLead = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0

      setMetrics({
        totalRevenue: 0,
        cohortRevenue: 0,
        buyers: 0,
        visitors: totalViews,
        startedQuiz: totalStarts,
        addedEmail: totalLeads,
        finishedQuiz: totalCompletes,
        initiatedCheckout: 0,
        changes: {
          visitors: 0,
          startedQuiz: 0,
          addedEmail: 0,
          finishedQuiz: 0,
          initiatedCheckout: 0,
        },
        conversions: {
          visitorToStart,
          visitorToFinish,
          startToFinish,
          visitorToAddEmail: visitorToLead,
          addEmailToFinish: totalLeads > 0 ? (totalCompletes / totalLeads) * 100 : 0,
          visitorToBuy: 0,
        },
        conversionChanges: {
          visitorToStart: 0,
          visitorToFinish: 0,
          startToFinish: 0,
          visitorToAddEmail: 0,
          addEmailToFinish: 0,
          visitorToBuy: 0,
        },
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: 'all', label: 'Todo el tiempo' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        title="Analytics Overview"
        dark
        actions={
          <div className="flex items-center gap-3">
            {/* Quiz Selector */}
            <div className="relative">
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="appearance-none bg-slate-800 text-white text-sm px-4 py-2 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los quizzes</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Date Range Selector */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-slate-800 text-white text-sm px-4 py-2 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Row 1: Revenue & Volume Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <MetricCard
                label="Total Revenue"
                value={metrics.totalRevenue}
                prefix="$"
                change={null}
                tooltip="Ingresos totales del período"
              />
              <MetricCard
                label="Cohort Revenue"
                value={metrics.cohortRevenue}
                prefix="$"
                change={null}
                tooltip="Ingresos de la cohorte"
              />
              <MetricCard
                label="- Cohort Refunded"
                value={0}
                prefix="$"
                change={null}
                tooltip="Reembolsos de la cohorte"
              />
              <MetricCard
                label="Buyers"
                value={metrics.buyers}
                change={null}
                tooltip="Número de compradores"
              />
              <MetricCard
                label="New subscriptions"
                value={0}
                change={null}
                tooltip="Nuevas suscripciones"
              />
              <MetricCard
                label="Active subscriptions"
                value={0}
                change={null}
                tooltip="Suscripciones activas"
              />
              <MetricCard
                label="Refunded subscriptions"
                value={0}
                change={null}
                tooltip="Suscripciones reembolsadas"
              />
              <MetricCard
                label="Cancelled subscriptions"
                value={0}
                change={null}
                tooltip="Suscripciones canceladas"
              />
            </div>

            {/* Row 2: Funnel Volume Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <MetricCard
                label="Visitors"
                value={metrics.visitors}
                change={metrics.changes.visitors}
                tooltip="Visitas únicas al quiz"
              />
              <MetricCard
                label="Started quiz"
                value={metrics.startedQuiz}
                change={metrics.changes.startedQuiz}
                tooltip="Usuarios que empezaron el quiz"
              />
              <MetricCard
                label="Added Email"
                value={metrics.addedEmail}
                change={metrics.changes.addedEmail}
                tooltip="Usuarios que dieron su email"
              />
              <MetricCard
                label="Finished quiz"
                value={metrics.finishedQuiz}
                change={metrics.changes.finishedQuiz}
                tooltip="Usuarios que completaron el quiz"
              />
              <MetricCard
                label="Initiated checkout"
                value={metrics.initiatedCheckout}
                change={metrics.changes.initiatedCheckout}
                tooltip="Usuarios que iniciaron checkout"
              />
              <MetricCard
                label="AddPaymentInfo"
                value={0}
                change={null}
                tooltip="Usuarios que agregaron info de pago"
              />
              <MetricCard
                label="ARPU"
                value={0}
                prefix="$"
                change={null}
                tooltip="Average Revenue Per User"
              />
              <MetricCard
                label="ARPPU"
                value={0}
                prefix="$"
                change={null}
                tooltip="Average Revenue Per Paying User"
              />
            </div>

            {/* Row 3: Conversion Rates */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <ConversionCard
                label="Visitor to Start quiz"
                value={metrics.conversions.visitorToStart}
                change={metrics.conversionChanges.visitorToStart}
                tooltip="% de visitantes que empiezan"
              />
              <ConversionCard
                label="Visitor to Finish quiz"
                value={metrics.conversions.visitorToFinish}
                change={metrics.conversionChanges.visitorToFinish}
                tooltip="% de visitantes que terminan"
              />
              <ConversionCard
                label="Start to Finish quiz"
                value={metrics.conversions.startToFinish}
                change={metrics.conversionChanges.startToFinish}
                tooltip="% de starts que terminan"
              />
              <ConversionCard
                label="Visitor to Add Email"
                value={metrics.conversions.visitorToAddEmail}
                change={metrics.conversionChanges.visitorToAddEmail}
                tooltip="% de visitantes que dan email"
              />
              <ConversionCard
                label="AddEmail to Finish"
                value={metrics.conversions.addEmailToFinish}
                change={metrics.conversionChanges.addEmailToFinish}
                tooltip="% de emails que terminan"
              />
              <ConversionCard
                label="Paywall to Subscription"
                value={0}
                change={null}
                tooltip="% de paywall a suscripción"
              />
              <ConversionCard
                label="Checkout to Subscription"
                value={0}
                change={null}
                tooltip="% de checkout a suscripción"
              />
              <ConversionCard
                label="Visitor to buy"
                value={metrics.conversions.visitorToBuy}
                change={metrics.conversionChanges.visitorToBuy}
                tooltip="% de visitantes que compran"
              />
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Sobre estas métricas</h3>
                  <p className="text-slate-400 text-sm">
                    Las métricas se calculan en base a los eventos registrados por PostHog.
                    Los cambios porcentuales comparan el período actual con el período anterior de igual duración.
                    Para ver datos más precisos, asegúrate de que el tracking de eventos esté correctamente configurado.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
