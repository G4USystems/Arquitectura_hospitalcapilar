import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hospital-capilar/shared/hooks'
import { getUserQuizzes, createQuiz, deleteQuiz, updateQuiz } from '@hospital-capilar/shared/firebase'
import { Quiz } from '@hospital-capilar/shared/components/quiz'
import { seedHospitalCapilarQuiz } from '../../scripts/seedHospitalCapilarQuiz'
import Header from '../../components/layout/Header'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Users,
  Wand2,
  Check,
  X,
} from 'lucide-react'

export default function QuizListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedError, setSeedError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [editingName, setEditingName] = useState(null) // quizId being renamed
  const [editNameValue, setEditNameValue] = useState('')
  const [previewQuiz, setPreviewQuiz] = useState(null) // quiz data for live preview
  const hasSeeded = useRef(false)
  const nameInputRef = useRef(null)

  useEffect(() => {
    loadQuizzes()
  }, [user])

  // Focus input when editing name
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  // Close menu on outside click
  useEffect(() => {
    function handleClick() { setMenuOpen(null) }
    if (menuOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [menuOpen])

  async function loadQuizzes() {
    if (!user) return

    try {
      let data = await getUserQuizzes(user.uid)

      if (data.length === 0 && !hasSeeded.current) {
        hasSeeded.current = true
        try {
          await seedHospitalCapilarQuiz(user.uid)
          data = await getUserQuizzes(user.uid)
        } catch (seedError) {
          console.error('Error seeding quiz:', seedError)
        }
      }

      setQuizzes(data)
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateQuiz() {
    if (!user || creating) return

    setCreating(true)
    try {
      const quiz = await createQuiz(user.uid, {
        name: 'Nuevo Quiz',
        slug: `quiz-${Date.now()}`,
      })
      navigate(`/quizzes/${quiz.id}`)
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

  function copyQuizUrl(slug, e) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/q/${slug}`
    navigator.clipboard.writeText(url)
    setMenuOpen(null)
  }

  function handlePreview(quiz, e) {
    e.preventDefault()
    e.stopPropagation()
    setPreviewQuiz(quiz)
    setMenuOpen(null)
  }

  async function handleForceSeed() {
    if (!user || seeding) return

    setSeeding(true)
    setSeedError(null)
    try {
      await seedHospitalCapilarQuiz(user.uid)
      const data = await getUserQuizzes(user.uid)
      setQuizzes(data)
    } catch (error) {
      console.error('Error seeding quiz:', error)
      setSeedError(error.message || 'Error desconocido')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      <Header
        title="Mis Quizzes"
        actions={
          <button
            onClick={handleCreateQuiz}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creando...' : 'Nuevo Quiz'}
          </button>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Crea tu primer quiz
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Empieza a capturar leads con quizzes interactivos y personalizados.
            </p>

            {seedError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                <p className="text-red-700 text-sm font-medium">Error al crear quiz:</p>
                <p className="text-red-600 text-xs mt-1 font-mono">{seedError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleForceSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-5 h-5" />
                {seeding ? 'Creando...' : 'Crear Quiz Hospital Capilar'}
              </button>
              <button
                onClick={handleCreateQuiz}
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {creating ? 'Creando...' : 'Crear Quiz Vacío'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Preview banner */}
                <div
                  className="h-32 relative cursor-pointer"
                  style={{ backgroundColor: quiz.branding?.primaryColor || '#2563EB' }}
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                >
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <button
                      onClick={(e) => handlePreview(quiz, e)}
                      className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100 transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Quiz
                    </button>
                    <Link
                      to={`/quizzes/${quiz.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Link>
                  </div>
                  {/* Status badge on preview */}
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full ${
                      quiz.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white/80 text-slate-600'
                    }`}
                  >
                    {quiz.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
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
                            className="flex-1 text-sm font-semibold text-slate-900 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleRenameQuiz(quiz.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingName(null)}
                            className="p-1 text-slate-400 hover:bg-slate-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h3
                          className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                          onDoubleClick={(e) => startRename(quiz, e)}
                          title="Doble clic para renombrar"
                        >
                          {quiz.name}
                        </h3>
                      )}
                      <p className="text-sm text-slate-500 mt-0.5">/{quiz.slug}</p>
                    </div>

                    {/* Actions dropdown */}
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMenuOpen(menuOpen === quiz.id ? null : quiz.id)
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-500" />
                      </button>

                      {menuOpen === quiz.id && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-10" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handlePreview(quiz, e)}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                            Ver quiz en vivo
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/quizzes/${quiz.id}`)
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                            Editar quiz
                          </button>
                          <button
                            onClick={(e) => startRename(quiz, e)}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                            Renombrar
                          </button>
                          <button
                            onClick={(e) => copyQuizUrl(quiz.slug, e)}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                          >
                            <Copy className="w-4 h-4 text-slate-400" />
                            Copiar URL
                          </button>
                          <hr className="my-1 border-slate-100" />
                          <button
                            onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Eye className="w-4 h-4" />
                      {quiz.stats?.totalViews || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Users className="w-4 h-4" />
                      {quiz.stats?.totalLeads || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <button
              onClick={handleCreateQuiz}
              disabled={creating}
              className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-[280px] flex flex-col items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <span className="text-sm font-medium text-slate-600">
                {creating ? 'Creando...' : 'Nuevo Quiz'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Preview header */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold">{previewQuiz.name}</h3>
                <p className="text-xs text-slate-400">Vista previa en vivo</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/quizzes/${previewQuiz.id}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Link>
                <button
                  onClick={() => setPreviewQuiz(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Quiz live preview */}
            <div className="flex-1 overflow-auto">
              <Quiz
                editableData={{
                  theme: {
                    primary: previewQuiz.branding?.primaryColor || '#4CA994',
                    secondary: '#2C3E50',
                    light: '#F0F7F6',
                    white: '#FFFFFF',
                  },
                  intro: previewQuiz.intro,
                  questions: previewQuiz.questions || [],
                  leadForm: previewQuiz.leadForm,
                  result: previewQuiz.result,
                  settings: previewQuiz.settings,
                  cta: previewQuiz.cta,
                }}
                decisionTree={previewQuiz.decisionTree}
                embedded={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
