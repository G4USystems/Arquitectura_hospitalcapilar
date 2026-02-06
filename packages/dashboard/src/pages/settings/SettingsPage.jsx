import { useState } from 'react'
import { useAuth } from '@hospital-capilar/shared/hooks'
import {
  Settings,
  User,
  Bell,
  Globe,
  CreditCard,
  Shield,
  Palette,
  Code,
  Save,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react'

const TABS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'domains', label: 'Dominios', icon: Globe },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'api', label: 'API & Webhooks', icon: Code },
  { id: 'billing', label: 'Facturacion', icon: CreditCard },
]

export default function SettingsPage() {
  const { userData, updateUserProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile state
  const [displayName, setDisplayName] = useState(userData?.displayName || '')
  const [company, setCompany] = useState(userData?.company || '')

  // Domains state
  const [customDomain, setCustomDomain] = useState('')
  const [domains, setDomains] = useState([])

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState({
    newLead: true,
    weeklyReport: true,
    experimentComplete: false,
  })

  // API state
  const [showApiKey, setShowApiKey] = useState(false)
  const apiKey = 'hc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateUserProfile?.({ displayName, company })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddDomain = () => {
    if (!customDomain) return
    setDomains([...domains, {
      id: Date.now(),
      domain: customDomain,
      status: 'pending',
      addedAt: new Date().toISOString(),
    }])
    setCustomDomain('')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuracion</h1>
        <p className="text-slate-500 mt-1">
          Gestiona tu cuenta, dominios y preferencias
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-56">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Informacion del Perfil</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Tu empresa"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Domains Tab */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Dominios Personalizados</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Usa tu propio dominio para los quizzes (ej: quiz.tuempresa.com)
                </p>

                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="quiz.tudominio.com"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddDomain}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Agregar
                  </button>
                </div>

                {domains.length > 0 ? (
                  <div className="space-y-3">
                    {domains.map((domain) => (
                      <div
                        key={domain.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-slate-400" />
                          <span className="font-medium text-slate-900">{domain.domain}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          domain.status === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {domain.status === 'verified' ? 'Verificado' : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay dominios configurados
                  </p>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Instrucciones DNS</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Agrega un registro CNAME apuntando a:
                  </p>
                  <div className="flex items-center gap-2 bg-white rounded p-2">
                    <code className="flex-1 text-sm text-slate-700">quiz.hospitalcapilar.app</code>
                    <button
                      onClick={() => copyToClipboard('quiz.hospitalcapilar.app')}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Notificaciones por Email</h2>

              <div className="space-y-4">
                {[
                  { id: 'newLead', label: 'Nuevo lead recibido', description: 'Recibe un email cada vez que alguien complete un quiz' },
                  { id: 'weeklyReport', label: 'Reporte semanal', description: 'Resumen de metricas cada lunes' },
                  { id: 'experimentComplete', label: 'Experimento completado', description: 'Cuando un A/B test alcanza significancia estadistica' },
                ].map((notif) => (
                  <div key={notif.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{notif.label}</h4>
                      <p className="text-sm text-slate-500">{notif.description}</p>
                    </div>
                    <button
                      onClick={() => setEmailNotifs({ ...emailNotifs, [notif.id]: !emailNotifs[notif.id] })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        emailNotifs[notif.id] ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          emailNotifs[notif.id] ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">API Key</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Usa esta clave para acceder a la API de QuizBuilder
                </p>

                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                  <code className="flex-1 text-sm font-mono text-slate-700">
                    {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 hover:bg-slate-200 rounded"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="p-2 hover:bg-slate-200 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-4"
                >
                  Ver documentacion de la API
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Embed Code</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Copia este codigo para embeber un quiz en tu sitio web
                </p>

                <div className="bg-slate-900 rounded-lg p-4">
                  <pre className="text-sm text-green-400 overflow-x-auto">
{`<script src="https://quiz.hospitalcapilar.app/embed.js"></script>
<div data-quiz-id="TU_QUIZ_ID"></div>`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Plan Actual</h2>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Plan Free</h3>
                    <p className="text-sm text-blue-700">3 quizzes, 100 leads/mes</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Upgrade a Pro
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Uso del mes</h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Quizzes</span>
                      <span className="text-slate-900 font-medium">1 / 3</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '33%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Leads</span>
                      <span className="text-slate-900 font-medium">24 / 100</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Branding Global</h2>
              <p className="text-sm text-slate-500 mb-6">
                Estos valores se aplicaran por defecto a todos los nuevos quizzes
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Logo de la empresa
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-6 h-6 text-slate-400" />
                    </div>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Subir Logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Color primario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#2563EB"
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#2563EB"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
