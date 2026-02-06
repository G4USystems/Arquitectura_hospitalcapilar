import { useQuizPreview } from '@hospital-capilar/shared/hooks'
import { Quiz } from '@hospital-capilar/shared/components/quiz'

export default function QuizPreview({ slug }) {
  const { quizData, decisionTree, loading, error } = useQuizPreview(slug)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400" />
      </div>
    )
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Preview no disponible</h1>
          <p className="text-gray-500">
            {error || 'El quiz que buscas no existe o no está disponible.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center text-sm font-medium py-1.5 shadow-md">
        Vista previa &mdash; {quizData.name || 'Sin nombre'}
      </div>
      <div className="pt-8">
        <Quiz
          editableData={quizData}
          decisionTree={decisionTree}
        />
      </div>
    </>
  )
}
