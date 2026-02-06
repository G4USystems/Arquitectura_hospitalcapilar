import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hospital-capilar/shared/hooks'
import {
  getUserCampaigns,
  createCampaign,
  deleteCampaign,
  getUserQuizzes,
  updateQuiz,
  deleteQuiz,
} from '@hospital-capilar/shared/firebase'
import Header from '../../components/layout/Header'
import {
  Plus,
  MoreVertical,
  Trash2,
  FolderOpen,
  FileQuestion,
  Eye,
  Users,
  Pencil,
  Check,
  X,
  Globe,
  Link as LinkIcon,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

// Hospital Capilar brand colors
const theme = {
  primary: '#4CA994',
  secondary: '#2C3E50',
  light: '#F0F7F6',
  white: '#FFFFFF',
}

export default function CampaignsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [editingSlug, setEditingSlug] = useState(null)
  const [editSlugValue, setEditSlugValue] = useState('')
  const slugInputRef = useRef(null)

  useEffect(() => { loadData() }, [user])

  useEffect(() => {
    if (editingSlug && slugInputRef.current) {
      slugInputRef.current.focus()
      slugInputRef.current.select()
    }
  }, [editingSlug])

  useEffect(() => {
    function handleClick() { setMenuOpen(null) }
    if (menuOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [menuOpen])

  async function loadData() {
    if (!user) return
    try {
      const [campaignsData, quizzesData] = await Promise.all([
        getUserCampaigns(user.uid),
        getUserQuizzes(user.uid),
      ])
      setCampaigns(campaignsData)
      setQuizzes(quizzesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCampaign() {
    if (!user || creating) return
    setCreating(true)
    try {
      const campaign = await createCampaign(user.uid, { name: 'Nueva Campaña' })
      navigate(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Error creando campaña: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleCreateCampaignWithQuizzes() {
    if (!user || creating) return
    setCreating(true)
    try {
      const campaign = await createCampaign(user.uid, { name: 'Mi Campaña' })
      for (const quiz of orphanQuizzes) {
        await updateQuiz(quiz.id, { campaignId: campaign.id })
      }
      navigate(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Error creando campaña: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteCampaign(campaignId) {
    if (!confirm('¿Eliminar esta campaña?')) return
    try {
      await deleteCampaign(campaignId)
      setCampaigns(campaigns.filter((c) => c.id !== campaignId))
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Error eliminando campaña: ' + error.message)
    }
    setMenuOpen(null)
  }

  async function handleDeleteQuiz(quizId) {
    if (!confirm('¿Eliminar este quiz? Esta acción no se puede deshacer.')) return
    try {
      await deleteQuiz(quizId)
      setQuizzes(quizzes.filter((q) => q.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
    setMenuOpen(null)
  }

  async function handleSaveSlug(quizId) {
    const trimmed = editSlugValue.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (!trimmed) { setEditingSlug(null); return }
    try {
      await updateQuiz(quizId, { slug: trimmed })
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, slug: trimmed } : q))
    } catch (error) {
      console.error('Error updating slug:', error)
    }
    setEditingSlug(null)
  }

  function getCampaignStats(campaign) {
    const cq = quizzes.filter(
      (q) => q.campaignId === campaign.id || campaign.quizIds?.includes(q.id)
    )
    return {
      totalViews: cq.reduce((sum, q) => sum + (q.stats?.totalViews || 0), 0),
      totalLeads: cq.reduce((sum, q) => sum + (q.stats?.totalLeads || 0), 0),
      quizCount: cq.length,
    }
  }

  const assignedQuizIds = new Set()
  campaigns.forEach((c) => {
    quizzes.forEach((q) => {
      if (q.campaignId === c.id || c.quizIds?.includes(q.id)) assignedQuizIds.add(q.id)
    })
  })
  const orphanQuizzes = quizzes.filter((q) => !assignedQuizIds.has(q.id))

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-1.5 w-full" style={{ backgroundColor: theme.primary }}></div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent" style={{ borderTopColor: theme.primary }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: theme.primary }}></div>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Campañas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestiona tus quizzes y configura los dominios</p>
          </div>
          <button
            onClick={handleCreateCampaign}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creando...' : 'Nueva Campaña'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Empty state */}
        {campaigns.length === 0 && orphanQuizzes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: theme.light }}>
              <Sparkles className="w-10 h-10" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Crea tu primera campaña
            </h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
              Las campañas agrupan quizzes, configuran el dominio personalizado y miden el rendimiento.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
              {[
                { icon: <Globe size={18} />, text: 'Dominio propio' },
                { icon: <Stethoscope size={18} />, text: 'Múltiples quizzes' },
                { icon: <ShieldCheck size={18} />, text: 'Analytics integrado' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                  <span style={{ color: theme.primary }}>{item.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={creating}
              className="px-10 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 disabled:opacity-50"
              style={{ backgroundColor: theme.primary }}
            >
              Comenzar <ChevronRight className="inline w-5 h-5 ml-1" />
            </button>
          </div>
        )}

        {/* Campaign Cards */}
        {campaigns.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {campaigns.map((campaign) => {
                const stats = getCampaignStats(campaign)

                return (
                  <div
                    key={campaign.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 group"
                  >
                    {/* Card header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: theme.light }}>
                            <FolderOpen className="w-5 h-5" style={{ color: theme.primary }} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{campaign.name}</h3>
                            {campaign.domain && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Globe className="w-3 h-3" />
                                {campaign.domain}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Menu button - separate from link to avoid overlay issues */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpen(menuOpen === campaign.id ? null : campaign.id)
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>

                          {menuOpen === campaign.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-30" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {campaign.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{campaign.description}</p>
                      )}

                      {/* Status badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: theme.light, color: theme.primary }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }}></span>
                          {campaign.status === 'active' ? 'Activa' : campaign.status === 'paused' ? 'Pausada' : 'Archivada'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {stats.quizCount} {stats.quizCount === 1 ? 'quiz' : 'quizzes'}
                        </span>
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-700">{stats.totalViews}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-700">{stats.totalLeads}</span>
                        </div>
                      </div>
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="text-sm font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: theme.primary }}
                      >
                        Abrir <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}

              {/* New campaign card */}
              <button
                onClick={handleCreateCampaign}
                disabled={creating}
                className="border-2 border-dashed border-gray-200 rounded-2xl min-h-[180px] flex flex-col items-center justify-center hover:border-[#4CA994] hover:bg-[#F0F7F6] transition-all duration-200 disabled:opacity-50 group"
              >
                <div className="w-12 h-12 bg-white border-2 border-gray-200 group-hover:border-[#4CA994] rounded-xl flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#4CA994] transition-colors" />
                </div>
                <span className="text-sm font-bold text-gray-500 group-hover:text-[#4CA994] transition-colors">
                  {creating ? 'Creando...' : 'Nueva Campaña'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* CTA: no campaigns but has quizzes */}
        {campaigns.length === 0 && orphanQuizzes.length > 0 && (
          <div className="rounded-2xl p-8 border border-gray-100" style={{ backgroundColor: theme.light }}>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <FolderOpen className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">Organizá tus quizzes en una campaña</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Tenés {orphanQuizzes.length} {orphanQuizzes.length === 1 ? 'quiz' : 'quizzes'} sin campaña.
                  Creá una para configurar el dominio y gestionar todo desde un solo lugar.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleCreateCampaignWithQuizzes}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Plus className="w-4 h-4" />
                    {creating ? 'Creando...' : 'Crear Campaña con estos Quizzes'}
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Campaña Vacía
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quizzes Table */}
        {orphanQuizzes.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.light }}>
                <FileQuestion className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Quizzes</h2>
                <p className="text-xs text-gray-500">{orphanQuizzes.length} sin asignar a una campaña</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-4">Quiz</div>
                <div className="col-span-3">URL / Slug</div>
                <div className="col-span-1 text-center">Estado</div>
                <div className="col-span-1 text-center">Vistas</div>
                <div className="col-span-1 text-center">Leads</div>
                <div className="col-span-2 text-right">Acciones</div>
              </div>

              {orphanQuizzes.map((quiz, idx) => (
                <div
                  key={quiz.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#F0F7F6] transition-colors ${
                    idx < orphanQuizzes.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: quiz.branding?.primaryColor || theme.primary }}
                    >
                      <FileQuestion className="w-4 h-4 text-white" />
                    </div>
                    <Link
                      to={`/quizzes/${quiz.id}`}
                      className="font-bold text-gray-900 hover:text-[#4CA994] transition-colors truncate"
                    >
                      {quiz.name}
                    </Link>
                  </div>

                  {/* URL / Slug */}
                  <div className="col-span-3 min-w-0">
                    {editingSlug === quiz.id ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 flex items-center border-2 rounded-xl overflow-hidden bg-white" style={{ borderColor: theme.primary }}>
                          <span className="px-2.5 py-2 bg-gray-50 text-xs text-gray-400 border-r border-gray-200 font-mono">/</span>
                          <input
                            ref={slugInputRef}
                            type="text"
                            value={editSlugValue}
                            onChange={(e) => setEditSlugValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSlug(quiz.id)
                              if (e.key === 'Escape') setEditingSlug(null)
                            }}
                            onBlur={() => handleSaveSlug(quiz.id)}
                            className="flex-1 px-2 py-2 text-sm focus:outline-none min-w-0 font-mono"
                          />
                        </div>
                        <button onClick={() => handleSaveSlug(quiz.id)} className="p-1 rounded hover:bg-green-50" style={{ color: theme.primary }}>
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingSlug(null)} className="p-1 text-gray-400 rounded hover:bg-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/url">
                        <code className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg truncate border border-gray-100 font-mono">
                          /{quiz.slug}
                        </code>
                        <button
                          onClick={() => { setEditingSlug(quiz.id); setEditSlugValue(quiz.slug) }}
                          className="p-1 text-gray-300 hover:text-[#4CA994] hover:bg-[#F0F7F6] rounded opacity-0 group-hover/url:opacity-100 transition-all"
                          title="Editar slug"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        quiz.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        quiz.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                      {quiz.status === 'published' ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm font-semibold text-gray-700">{quiz.stats?.totalViews || 0}</span>
                  </div>

                  {/* Leads */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm font-semibold text-gray-700">{quiz.stats?.totalLeads || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <Link
                      to={`/quizzes/${quiz.id}`}
                      className="p-2 text-gray-400 hover:text-[#4CA994] hover:bg-[#F0F7F6] rounded-lg transition-colors"
                      title="Editar quiz"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => { setEditingSlug(quiz.id); setEditSlugValue(quiz.slug) }}
                      className="p-2 text-gray-400 hover:text-[#4CA994] hover:bg-[#F0F7F6] rounded-lg transition-colors"
                      title="Cambiar URL"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer credentials - matching quiz style */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <ShieldCheck size={14} /> Datos protegidos
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
