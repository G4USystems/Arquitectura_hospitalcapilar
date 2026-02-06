import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@hospital-capilar/shared/hooks'
import {
  getCampaign,
  updateCampaign,
  getCampaignQuizzes,
  getUserQuizzes,
  createQuiz,
  deleteQuiz,
  updateQuiz,
  duplicateQuiz,
} from '@hospital-capilar/shared/firebase'
import Header from '../../components/layout/Header'
import {
  ArrowLeft,
  Plus,
  Save,
  Globe,
  Eye,
  ExternalLink,
  Users,
  Pencil,
  Trash2,
  Copy,
  MoreVertical,
  Check,
  X,
  FileQuestion,
  Link as LinkIcon,
} from 'lucide-react'

export default function CampaignEditorPage() {
  const { campaignId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Campaign state
  const [campaign, setCampaign] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState('active')

  // Quiz management state
  const [menuOpen, setMenuOpen] = useState(null)
  const [editingName, setEditingName] = useState(null)
  const [editNameValue, setEditNameValue] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [orphanQuizzes, setOrphanQuizzes] = useState([])
  const nameInputRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [campaignId, user])

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  useEffect(() => {
    function handleClick() { setMenuOpen(null) }
    if (menuOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [menuOpen])

  async function loadData() {
    if (!user || !campaignId) return

    try {
      const [campaignData, quizzesByCampaignId, allUserQuizzes] = await Promise.all([
        getCampaign(campaignId),
        getCampaignQuizzes(campaignId),
        getUserQuizzes(user.uid),
      ])

      if (!campaignData) {
        navigate('/campaigns')
        return
      }

      // Merge: quizzes with campaignId + legacy quizzes in quizIds array
      const legacyQuizIds = campaignData.quizIds || []
      const legacyQuizzes = allUserQuizzes.filter(
        q => legacyQuizIds.includes(q.id) && q.campaignId !== campaignId
      )

      // Auto-migrate legacy quizzes: set their campaignId
      for (const quiz of legacyQuizzes) {
        try {
          await updateQuiz(quiz.id, { campaignId })
        } catch (e) {
          console.error('Error migrating quiz:', e)
        }
      }

      // Combine and deduplicate
      const allQuizIds = new Set()
      const combined = []
      for (const q of [...quizzesByCampaignId, ...legacyQuizzes]) {
        if (!allQuizIds.has(q.id)) {
          allQuizIds.add(q.id)
          combined.push({ ...q, campaignId })
        }
      }

      // Find orphan quizzes (no campaignId assigned)
      const orphans = allUserQuizzes.filter(q => !q.campaignId && !allQuizIds.has(q.id))
      setOrphanQuizzes(orphans)

      setCampaign(campaignData)
      setQuizzes(combined)
      setName(campaignData.name || '')
      setDescription(campaignData.description || '')
      setDomain(campaignData.domain || '')
      setStatus(campaignData.status || 'active')
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!campaign) return
    setSaving(true)
    try {
      await updateCampaign(campaignId, { name, description, domain, status })
      setCampaign({ ...campaign, name, description, domain, status })
    } catch (error) {
      console.error('Error saving campaign:', error)
    } finally {
      setSaving(false)
    }
  }

  // Quiz CRUD
  async function handleCreateQuiz() {
    if (!user || creating) return
    setCreating(true)
    try {
      const quiz = await createQuiz(user.uid, {
        name: 'Nuevo Quiz',
        slug: `quiz-${Date.now()}`,
        campaignId,
      })
      navigate(`/campaigns/${campaignId}/quizzes/${quiz.id}`)
    } catch (error) {
      console.error('Error creating quiz:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteQuiz(quizId, e) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar este quiz? Esta acción no se puede deshacer.')) return
    try {
      await deleteQuiz(quizId)
      setQuizzes(quizzes.filter((q) => q.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
    setMenuOpen(null)
  }

  async function handleDuplicateQuiz(quizId, e) {
    e.preventDefault()
    e.stopPropagation()
    try {
      const newId = await duplicateQuiz(quizId)
      // Also set campaignId on the duplicate
      await updateQuiz(newId, { campaignId })
      const updatedQuizzes = await getCampaignQuizzes(campaignId)
      setQuizzes(updatedQuizzes)
    } catch (error) {
      console.error('Error duplicating quiz:', error)
    }
    setMenuOpen(null)
  }

  async function handleRenameQuiz(quizId) {
    const trimmed = editNameValue.trim()
    if (!trimmed) {
      setEditingName(null)
      return
    }
    try {
      await updateQuiz(quizId, { name: trimmed })
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, name: trimmed } : q))
    } catch (error) {
      console.error('Error renaming quiz:', error)
    }
    setEditingName(null)
  }

  function startRename(quiz, e) {
    e.preventDefault()
    e.stopPropagation()
    setEditingName(quiz.id)
    setEditNameValue(quiz.name)
    setMenuOpen(null)
  }

  function getPreviewUrl(quiz) {
    return `${import.meta.env.VITE_QUIZ_BASE_URL || 'http://localhost:5174'}/preview/${quiz.slug}`
  }

  async function handleAssignQuiz(quizId) {
    try {
      await updateQuiz(quizId, { campaignId })
      const assigned = orphanQuizzes.find(q => q.id === quizId)
      if (assigned) {
        setQuizzes([...quizzes, { ...assigned, campaignId }])
        setOrphanQuizzes(orphanQuizzes.filter(q => q.id !== quizId))
      }
    } catch (error) {
      console.error('Error assigning quiz:', error)
    }
  }

  function getQuizUrl(quiz) {
    if (domain) return `${domain}/${quiz.slug}`
    return `/${quiz.slug}`
  }

  // Stats
  const totalStats = {
    views: quizzes.reduce((sum, q) => sum + (q.stats?.totalViews || 0), 0),
    leads: quizzes.reduce((sum, q) => sum + (q.stats?.totalLeads || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/campaigns')}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
              placeholder="Nombre de la campaña"
            />
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Activa</option>
              <option value="paused">Pausada</option>
              <option value="archived">Archivada</option>
            </select>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domain Configuration */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Dominio</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Dominio personalizado
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <span className="px-3 py-2.5 bg-slate-50 text-sm text-slate-400 border-r border-slate-200">
                        https://
                      </span>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="quiz.tudominio.com"
                        className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Los quizzes serán accesibles en: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{domain || 'tu-dominio.com'}/slug-del-quiz</code>
                  </p>
                </div>
                {description !== undefined && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Descripción de la campaña
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe el objetivo de esta campaña..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quizzes Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-slate-900">
                    Quizzes ({quizzes.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {orphanQuizzes.length > 0 && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar existente ({orphanQuizzes.length})
                    </button>
                  )}
                  <button
                    onClick={handleCreateQuiz}
                    disabled={creating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {creating ? 'Creando...' : 'Nuevo Quiz'}
                  </button>
                </div>
              </div>

              {quizzes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-medium text-slate-700 mb-1">
                    No hay quizzes en esta campaña
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">
                    Crea tu primer quiz para empezar a capturar leads
                  </p>
                  <button
                    onClick={handleCreateQuiz}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Quiz
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      {/* Quiz color banner */}
                      <div
                        className="h-20 relative cursor-pointer"
                        style={{ backgroundColor: quiz.branding?.primaryColor || '#2563EB' }}
                        onClick={() => navigate(`/campaigns/${campaignId}/quizzes/${quiz.id}`)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <a
                            href={getPreviewUrl(quiz)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Preview
                          </a>
                          <Link
                            to={`/campaigns/${campaignId}/quizzes/${quiz.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs font-medium text-white hover:bg-blue-700 transition flex items-center gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </Link>
                        </div>
                        <span className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                          quiz.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-white/80 text-slate-600'
                        }`}>
                          {quiz.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>

                      {/* Quiz info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {editingName === quiz.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  ref={nameInputRef}
                                  type="text"
                                  value={editNameValue}
                                  onChange={(e) => setEditNameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameQuiz(quiz.id)
                                    if (e.key === 'Escape') setEditingName(null)
                                  }}
                                  onBlur={() => handleRenameQuiz(quiz.id)}
                                  className="flex-1 text-sm font-semibold text-slate-900 border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button onClick={() => handleRenameQuiz(quiz.id)} className="p-0.5 text-green-600 hover:bg-green-50 rounded">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingName(null)} className="p-0.5 text-slate-400 hover:bg-slate-100 rounded">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <h4
                                className="font-semibold text-sm text-slate-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                                onDoubleClick={(e) => startRename(quiz, e)}
                                title="Doble clic para renombrar"
                              >
                                {quiz.name}
                              </h4>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              {getQuizUrl(quiz)}
                            </p>
                          </div>

                          {/* Actions dropdown */}
                          <div className="relative ml-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setMenuOpen(menuOpen === quiz.id ? null : quiz.id)
                              }}
                              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>

                            {menuOpen === quiz.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-10" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={getPreviewUrl(quiz)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setMenuOpen(null)}
                                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4 text-slate-400" />
                                  Preview
                                </a>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/campaigns/${campaignId}/quizzes/${quiz.id}`)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400" />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => startRename(quiz, e)}
                                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400" />
                                  Renombrar
                                </button>
                                <button
                                  onClick={(e) => handleDuplicateQuiz(quiz.id, e)}
                                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4 text-slate-400" />
                                  Duplicar
                                </button>
                                <hr className="my-1 border-slate-100" />
                                <button
                                  onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quiz stats */}
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Eye className="w-3.5 h-3.5" />
                            {quiz.stats?.totalViews || 0}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="w-3.5 h-3.5" />
                            {quiz.stats?.totalLeads || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Create new card */}
                  <button
                    onClick={handleCreateQuiz}
                    disabled={creating}
                    className="bg-white border-2 border-dashed border-slate-200 rounded-xl h-[180px] flex flex-col items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                      {creating ? 'Creando...' : 'Nuevo Quiz'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Total Vistas</span>
                  <span className="font-semibold text-slate-900">{totalStats.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Total Leads</span>
                  <span className="font-semibold text-slate-900">{totalStats.leads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Conversión</span>
                  <span className="font-semibold text-slate-900">
                    {totalStats.views > 0
                      ? ((totalStats.leads / totalStats.views) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Quizzes</span>
                  <span className="font-semibold text-slate-900">{quizzes.length}</span>
                </div>
              </div>
            </div>

            {/* Domain preview */}
            {domain && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">URLs de Quizzes</h3>
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center gap-2 text-xs">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-600 truncate">
                        {domain}/{quiz.slug}
                      </span>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <p className="text-xs text-slate-400">Crea un quiz para ver su URL</p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Link
                  to={`/experiments/new?campaignId=${campaignId}`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Crear Experimento A/B
                </Link>
                <Link
                  to={`/analytics?campaignId=${campaignId}`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Existing Quiz Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Agregar quiz existente</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {orphanQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay quizzes sin asignar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orphanQuizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        handleAssignQuiz(quiz.id)
                        if (orphanQuizzes.length <= 1) setShowAssignModal(false)
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: quiz.branding?.primaryColor || '#2563EB' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{quiz.name}</p>
                        <p className="text-sm text-slate-500">/{quiz.slug}</p>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
