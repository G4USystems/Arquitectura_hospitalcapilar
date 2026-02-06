import { Sparkles, Clock, Stethoscope, ShieldCheck, ChevronRight } from 'lucide-react'

export default function WelcomeScreen({ screen, quiz, onNext }) {
  const primaryColor = quiz?.branding?.primaryColor || '#4CA994'
  const config = screen?.config || {}

  const features = config.features || ['Análisis Completo', 'Revisión Médica', '100% Privado']
  const featureIcons = [Clock, Stethoscope, ShieldCheck]

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 relative overflow-hidden">
      {/* Top Bar */}
      <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

      {/* Navigation */}
      <nav className="p-4 flex justify-between items-center max-w-5xl mx-auto">
        <div className="font-bold text-xl tracking-tight text-gray-800 flex items-center gap-2">
          {quiz?.branding?.logoUrl ? (
            <img src={quiz.branding.logoUrl} alt="Logo" className="h-8 w-auto" />
          ) : (
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
          )}
          <span className="hidden sm:inline">{quiz?.name || 'Quiz'}</span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-xl mx-auto px-6 py-8 md:py-12 flex flex-col items-center text-center mt-4 md:mt-8">
        {/* Badge */}
        {config.badge && (
          <div
            className="px-4 py-1.5 rounded-full text-sm font-bold mb-6 inline-flex items-center gap-2"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Sparkles size={16} /> {config.badge}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          {screen?.title?.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line.includes('*') ? (
                <span style={{ color: primaryColor }}>{line.replace(/\*/g, '')}</span>
              ) : (
                line
              )}
            </span>
          )) || 'Bienvenido al Quiz'}
        </h1>

        {/* Subtitle */}
        {screen?.subtitle && (
          <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-10 max-w-md mx-auto leading-relaxed">
            {screen.subtitle}
          </p>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full mb-8 md:mb-10 text-left">
            {features.map((feature, i) => {
              const Icon = featureIcons[i % featureIcons.length]
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"
                >
                  <Icon size={20} style={{ color: primaryColor }} />
                  <span className="text-sm font-semibold text-gray-700">{feature}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onNext}
          className="w-full md:w-auto px-8 md:px-12 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          {config.buttonText || 'Comenzar'} <ChevronRight size={20} />
        </button>

        {/* Footer text */}
        {config.footerText && (
          <p className="mt-6 text-xs text-gray-400">
            {config.footerText}
          </p>
        )}
      </div>
    </div>
  )
}
