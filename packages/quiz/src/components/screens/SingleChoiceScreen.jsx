import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function SingleChoiceScreen({
  screen,
  quiz,
  currentStep,
  totalSteps,
  onAnswer,
  onBack,
  canGoBack = true,
}) {
  const primaryColor = quiz?.branding?.primaryColor || '#4CA994'
  const progress = ((currentStep - 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: primaryColor }}
        />
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 flex flex-col">
        {/* Back Button */}
        {canGoBack && currentStep > 1 && (
          <button
            onClick={onBack}
            className="self-start text-gray-400 hover:text-gray-600 mb-6 md:mb-8 p-2 -ml-2 rounded-full hover:bg-gray-50 transition"
          >
            <ArrowLeft size={24} />
          </button>
        )}

        {/* Question Text */}
        <div className="mb-6 md:mb-8">
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2 block">
            Paso {currentStep} de {totalSteps}
          </span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {screen?.title || 'Pregunta'}
          </h2>
          {screen?.subtitle && (
            <p className="text-gray-500 text-base md:text-lg">{screen.subtitle}</p>
          )}
        </div>

        {/* Options */}
        <div className="grid gap-3 md:gap-4 grid-cols-1">
          {(screen?.options || []).map((option, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(option.value || option.label)}
              className="group relative flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl border-2 border-gray-100 hover:border-current transition-all duration-200 text-left"
              style={{ '--hover-color': primaryColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = primaryColor
                e.currentTarget.style.backgroundColor = `${primaryColor}08`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f3f4f6'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* Icon */}
              {option.icon && (
                <span className="text-2xl w-10 text-center flex-shrink-0">{option.icon}</span>
              )}

              {/* Label & Description */}
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-gray-800 text-base md:text-lg group-hover:text-current transition-colors">
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-sm text-gray-500 mt-0.5">{option.description}</span>
                )}
              </div>

              {/* Radio indicator */}
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-current flex items-center justify-center ml-2 flex-shrink-0 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck size={14} /> Datos protegidos
        </p>
      </div>
    </div>
  )
}
