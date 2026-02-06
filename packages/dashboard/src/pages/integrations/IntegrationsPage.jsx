import { useState } from 'react'
import { useAuth } from '@hospital-capilar/shared/hooks'
import {
  Puzzle,
  Check,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react'

const INTEGRATION_TYPES = [
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Rastrea eventos y conversiones en GA4',
    icon: '📊',
    color: 'bg-orange-100 text-orange-700',
    fields: [
      { name: 'measurementId', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX' }
    ]
  },
  {
    id: 'meta_pixel',
    name: 'Meta Pixel',
    description: 'Trackea eventos para Facebook/Instagram Ads',
    icon: '📘',
    color: 'bg-blue-100 text-blue-700',
    fields: [
      { name: 'pixelId', label: 'Pixel ID', placeholder: '1234567890' }
    ]
  },
  {
    id: 'google_tag_manager',
    name: 'Google Tag Manager',
    description: 'Gestiona todos tus tags desde GTM',
    icon: '🏷️',
    color: 'bg-blue-100 text-blue-700',
    fields: [
      { name: 'containerId', label: 'Container ID', placeholder: 'GTM-XXXXXXX' }
    ]
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Envia leads a tu CRM o sistema externo',
    icon: '🔗',
    color: 'bg-purple-100 text-purple-700',
    fields: [
      { name: 'url', label: 'Webhook URL', placeholder: 'https://tu-servidor.com/webhook' },
      { name: 'secret', label: 'Secret (opcional)', placeholder: 'clave-secreta', type: 'password' }
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecta con 5000+ aplicaciones',
    icon: '⚡',
    color: 'bg-orange-100 text-orange-700',
    fields: [
      { name: 'webhookUrl', label: 'Zapier Webhook URL', placeholder: 'https://hooks.zapier.com/...' }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Envia leads directamente a HubSpot CRM',
    icon: '🧡',
    color: 'bg-orange-100 text-orange-700',
    fields: [
      { name: 'portalId', label: 'Portal ID', placeholder: '12345678' },
      { name: 'formGuid', label: 'Form GUID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
    ]
  },
]

export default function IntegrationsPage() {
  const { userData } = useAuth()
  const [integrations, setIntegrations] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({})
  const [showSecrets, setShowSecrets] = useState({})

  const handleAddIntegration = () => {
    if (!selectedType) return

    const newIntegration = {
      id: `int_${Date.now()}`,
      type: selectedType.id,
      name: selectedType.name,
      icon: selectedType.icon,
      color: selectedType.color,
      config: { ...formData },
      enabled: true,
      createdAt: new Date().toISOString(),
    }

    setIntegrations([...integrations, newIntegration])
    setShowAddModal(false)
    setSelectedType(null)
    setFormData({})
  }

  const toggleIntegration = (id) => {
    setIntegrations(integrations.map(int =>
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ))
  }

  const deleteIntegration = (id) => {
    setIntegrations(integrations.filter(int => int.id !== id))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integraciones</h1>
          <p className="text-slate-500 mt-1">
            Conecta tus quizzes con herramientas de analytics, CRM y marketing
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Integracion
        </button>
      </div>

      {/* Active Integrations */}
      {integrations.length > 0 ? (
        <div className="grid gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-xl`}>
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                    <p className="text-sm text-slate-500">
                      {integration.enabled ? 'Activa' : 'Desactivada'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleIntegration(integration.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      integration.enabled ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integration.enabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteIntegration(integration.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Config Preview */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key} className="text-xs bg-slate-100 px-2 py-1 rounded">
                      <span className="text-slate-500">{key}:</span>{' '}
                      <span className="text-slate-700">
                        {key.includes('secret') || key.includes('Secret')
                          ? '••••••••'
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Puzzle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Sin integraciones activas
          </h3>
          <p className="text-slate-500 mb-6">
            Conecta tu primera integracion para enviar datos a tus herramientas favoritas
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Integracion
          </button>
        </div>
      )}

      {/* Available Integrations */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Integraciones Disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATION_TYPES.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => {
                setSelectedType(type)
                setShowAddModal(true)
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center text-xl`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{type.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {selectedType ? `Configurar ${selectedType.name}` : 'Seleccionar Integracion'}
            </h2>

            {!selectedType ? (
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {INTEGRATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900">{type.name}</p>
                      <p className="text-sm text-slate-500">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedType.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !showSecrets[field.name] ? 'password' : 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowSecrets({ ...showSecrets, [field.name]: !showSecrets[field.name] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSecrets[field.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedType(null)
                  setFormData({})
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              {selectedType && (
                <button
                  onClick={handleAddIntegration}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
