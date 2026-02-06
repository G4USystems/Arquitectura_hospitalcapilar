import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthGuard } from '@hospital-capilar/shared/hooks'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import QuizEditorPage from './pages/quiz/QuizEditorPage'
import LeadsPage from './pages/leads/LeadsPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import CampaignsListPage from './pages/campaigns/CampaignsListPage'
import CampaignEditorPage from './pages/campaigns/CampaignEditorPage'
import ExperimentsListPage from './pages/experiments/ExperimentsListPage'
import ExperimentEditorPage from './pages/experiments/ExperimentEditorPage'
import IntegrationsPage from './pages/integrations/IntegrationsPage'
import SettingsPage from './pages/settings/SettingsPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <AuthGuard fallback={<Navigate to="/login" replace />}>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/campaigns" replace />} />
        <Route path="campaigns" element={<CampaignsListPage />} />
        <Route path="campaigns/:campaignId" element={<CampaignEditorPage />} />
        <Route path="campaigns/:campaignId/quizzes/:quizId" element={<QuizEditorPage />} />
        {/* Legacy route - quiz editor without campaign context */}
        <Route path="quizzes/:quizId" element={<QuizEditorPage />} />
        <Route path="experiments" element={<ExperimentsListPage />} />
        <Route path="experiments/:experimentId" element={<ExperimentEditorPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
