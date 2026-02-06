import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuizEditor } from '@hospital-capilar/shared/hooks'
import { publishQuiz, unpublishQuiz, duplicateQuiz } from '@hospital-capilar/shared/firebase'
import { Quiz, EditorPanel, mergeWithDefaults, DEFAULT_QUIZ_DATA } from '@hospital-capilar/shared/components/quiz'
import {
  ArrowLeft,
  Globe,
  GlobeLock,
  Copy,
  Monitor,
  Smartphone,
  Tablet,
  Pencil,
  X,
  ExternalLink,
} from 'lucide-react'

export default function QuizEditorPage() {
  const { quizId, campaignId } = useParams()
  const navigate = useNavigate()
  const backUrl = campaignId ? `/campaigns/${campaignId}` : '/campaigns'
  const quizNavRef = useRef(null)

  const {
    quiz,
    screens,
    loading,
    error,
    saveQuiz,
    addScreen,
    saveScreen,
    removeScreen,
  } = useQuizEditor(quizId)

  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('desktop')
  const [isEditMode, setIsEditMode] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  // Quiz data converted from screens to the format Quiz component expects
  const [quizData, setQuizData] = useState(null)
  const [decisionTree, setDecisionTree] = useState(null)
  const [quizFlow, setQuizFlow] = useState(null)

  // Convert Firestore screens to quiz questions format when data loads
  // Apply mergeWithDefaults so both editor and preview show proper values
  useEffect(() => {
    if (quiz && screens) {
      setQuizData({
        slug: quiz.slug,
        name: quiz.name,
        theme: mergeWithDefaults(DEFAULT_QUIZ_DATA.theme, {
          primary: quiz.branding?.primaryColor,
          secondary: quiz.branding?.secondaryColor,
          light: quiz.branding?.lightColor,
        }),
        settings: quiz.settings || { showProgressBar: true, allowBack: true },
        cta: quiz.cta || { type: 'none' },
        intro: mergeWithDefaults(DEFAULT_QUIZ_DATA.intro, quiz.intro),
        questions: screens.map(screen => ({
          id: screen.id,
          title: screen.title,
          subtitle: screen.subtitle || '',
          type: screen.type === 'single_choice' ? 'single' : screen.type,
          options: screen.options || [],
          autoAdvanceSeconds: screen.autoAdvanceSeconds,
        })),
        leadForm: mergeWithDefaults(DEFAULT_QUIZ_DATA.leadForm, quiz.leadForm),
        result: mergeWithDefaults(DEFAULT_QUIZ_DATA.result, quiz.result),
        analysis: quiz.analysis || {},
      })
      setDecisionTree(quiz.decisionTree || getDefaultDecisionTree())
      setQuizFlow(quiz.flow || null)
    }
  }, [quiz, screens])

  if (loading || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Quiz no encontrado'}</p>
          <Link to={backUrl} className="text-blue-600 hover:text-blue-700">
            Volver a la campaña
          </Link>
        </div>
      </div>
    )
  }

  // Navigate quiz preview to a specific step
  function handleGoToStep(step) {
    if (quizNavRef.current) {
      quizNavRef.current(step)
    }
  }

  // Handlers
  async function handleTogglePublish() {
    setSaving(true)
    try {
      if (quiz.status === 'published') {
        await unpublishQuiz(quizId)
      } else {
        await publishQuiz(quizId)
      }
    } catch (err) {
      console.error('Error toggling publish:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDuplicateQuiz() {
    try {
      const newQuizId = await duplicateQuiz(quizId)
      const newUrl = campaignId ? `/campaigns/${campaignId}/quizzes/${newQuizId}` : `/quizzes/${newQuizId}`
      navigate(newUrl)
    } catch (err) {
      console.error('Error duplicating quiz:', err)
    }
  }

  function handleUpdateQuiz(updates) {
    setQuizData(prev => ({ ...prev, ...updates }))
    // Save relevant fields to Firestore
    if (updates.cta) saveQuiz({ cta: updates.cta })
    if (updates.intro) saveQuiz({ intro: updates.intro })
    if (updates.settings) saveQuiz({ settings: updates.settings })
    if (updates.slug) saveQuiz({ slug: updates.slug })
    if (updates.customDomain) saveQuiz({ customDomain: updates.customDomain })
    if (updates.analysis) saveQuiz({ analysis: updates.analysis })
    if (updates.leadForm) saveQuiz({ leadForm: updates.leadForm })
    if (updates.result) saveQuiz({ result: updates.result })
    if (updates.theme) {
      saveQuiz({ branding: { primaryColor: updates.theme.primary, secondaryColor: updates.theme.secondary } })
    }
  }

  async function handleUpdateQuestion(index, data) {
    const question = quizData.questions[index]
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, ...data } : q)
    }))
    // Persist to Firestore
    if (question?.id) {
      try {
        const screenData = {
          title: data.title,
          subtitle: data.subtitle || '',
          type: data.type === 'single' ? 'single_choice' : data.type,
          options: data.options || [],
        }
        if (data.autoAdvanceSeconds != null) screenData.autoAdvanceSeconds = data.autoAdvanceSeconds
        await saveScreen(question.id, screenData)
      } catch (err) {
        console.error('Error saving screen:', err)
      }
    }
  }

  async function handleAddQuestion() {
    try {
      const newScreen = await addScreen({
        title: 'Nueva pregunta',
        subtitle: '',
        type: 'single_choice',
        options: [
          { label: 'Opción 1', icon: '' },
          { label: 'Opción 2', icon: '' }
        ],
        order: quizData.questions.length,
      })
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, {
          id: newScreen.id,
          title: newScreen.title,
          subtitle: '',
          type: 'single',
          options: newScreen.options,
        }]
      }))
    } catch (err) {
      console.error('Error adding question:', err)
    }
  }

  async function handleDeleteQuestion(index) {
    if (quizData.questions.length <= 1) {
      alert('Debe haber al menos una pregunta')
      return
    }
    const question = quizData.questions[index]
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
    // Delete from Firestore
    if (question?.id) {
      try {
        await removeScreen(question.id)
      } catch (err) {
        console.error('Error deleting screen:', err)
      }
    }
  }

  function handleUpdateDecisionTree(newTree) {
    setDecisionTree(newTree)
    saveQuiz({ decisionTree: newTree })
  }

  function handleUpdateFlow(newFlow) {
    setQuizFlow(newFlow)
    saveQuiz({ flow: newFlow })
  }

  // Save all current state to Firestore
  async function handleSaveAll() {
    setSaving(true)
    try {
      await saveQuiz({
        intro: quizData.intro,
        leadForm: quizData.leadForm,
        settings: quizData.settings,
        cta: quizData.cta,
        analysis: quizData.analysis,
        branding: {
          primaryColor: quizData.theme?.primary,
          secondaryColor: quizData.theme?.secondary,
        },
      })
      // Also save all questions
      for (const q of quizData.questions) {
        if (q.id) {
          const screenData = {
            title: q.title,
            subtitle: q.subtitle || '',
            type: q.type === 'single' ? 'single_choice' : q.type,
            options: q.options || [],
          }
          if (q.autoAdvanceSeconds != null) screenData.autoAdvanceSeconds = q.autoAdvanceSeconds
          await saveScreen(q.id, screenData)
        }
      }
    } catch (err) {
      console.error('Error saving all:', err)
    } finally {
      setSaving(false)
    }
  }

  // Viewport sizes
  const viewportSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(backUrl)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <input
            type="text"
            value={quiz.name}
            onChange={(e) => saveQuiz({ name: e.target.value })}
            className="text-lg font-semibold text-white bg-transparent border-none focus:outline-none focus:ring-0"
          />
          <span className={`text-xs px-2 py-1 rounded-full ${
            quiz.status === 'published'
              ? 'bg-green-900 text-green-300'
              : 'bg-amber-900 text-amber-300'
          }`}>
            {quiz.status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport selector */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1 mr-2">
            {[
              { id: 'desktop', icon: Monitor },
              { id: 'tablet', icon: Tablet },
              { id: 'mobile', icon: Smartphone },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === id
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Edit mode toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEditMode
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isEditMode ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {isEditMode ? 'Cerrar Editor' : 'Editar'}
          </button>

          <div className="w-px h-6 bg-slate-600 mx-1" />

          <a
            href={`${import.meta.env.VITE_QUIZ_BASE_URL || 'http://localhost:5174'}/preview/${quiz.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </a>

          <button
            onClick={handleDuplicateQuiz}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              quiz.status === 'published'
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {quiz.status === 'published' ? (
              <>
                <GlobeLock className="w-4 h-4" />
                Despublicar
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                Publicar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content - Quiz + Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Quiz Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 h-[calc(100vh-140px)] ${viewportSizes[viewMode]}`}
          >
            <div className="h-full overflow-auto">
              <Quiz
                editableData={quizData}
                decisionTree={decisionTree}
                onStepChange={setCurrentStep}
                isEditMode={isEditMode}
                embedded={true}
                navRef={quizNavRef}
              />
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        {isEditMode && (
          <EditorPanel
            quiz={quizData}
            currentStep={currentStep}
            onUpdateQuiz={handleUpdateQuiz}
            onUpdateQuestion={handleUpdateQuestion}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorderQuestions={() => {}}
            onClose={() => setIsEditMode(false)}
            onGoToStep={handleGoToStep}
            decisionTree={decisionTree}
            onUpdateDecisionTree={handleUpdateDecisionTree}
            quizFlow={quizFlow}
            onUpdateFlow={handleUpdateFlow}
            onDuplicateQuiz={handleDuplicateQuiz}
            onSaveAll={handleSaveAll}
          />
        )}
      </div>

      {/* Footer info */}
      <div className="h-8 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span>Slug: <code className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">{quiz.slug}</code></span>
          <span>Paso: {currentStep} / {quizData.questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-amber-400">Guardando...</span>}
          <span>Cambios se guardan automáticamente</span>
        </div>
      </div>
    </div>
  )
}

// Default decision tree
function getDefaultDecisionTree() {
  return {
    rules: [],
    defaultResult: {
      type: 'success',
      title: 'Resultado',
      description: 'Gracias por completar el quiz',
      cta: { type: 'form', text: 'Continuar' }
    },
    scoreRules: {}
  }
}
