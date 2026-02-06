import { useState, useEffect } from 'react'
import { Dna } from 'lucide-react'

export default function LoadingScreen({ screen, quiz, onComplete }) {
  const primaryColor = quiz?.branding?.primaryColor || '#4CA994'
  const [progress, setProgress] = useState(0)

  const config = screen?.config || {}
  const steps = config.steps || [
    { threshold: 20, text: 'Verificando información...' },
    { threshold: 50, text: 'Procesando respuestas...' },
    { threshold: 80, text: 'Generando resultados...' },
  ]

  const duration = config.duration || 3000 // ms

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 300)
          return 100
        }
        return prev + 1
      })
    }, duration / 100)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Spinning Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div
            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: `${primaryColor} transparent transparent transparent`,
            }}
          />
          <Dna className="absolute inset-0 m-auto text-gray-400" size={32} />
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          {screen?.title || 'Procesando...'}
        </h2>

        {/* Subtitle */}
        {screen?.subtitle && (
          <p className="text-gray-500 mb-8">{screen.subtitle}</p>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%`, backgroundColor: primaryColor }}
          />
        </div>

        {/* Dynamic Steps */}
        <div className="text-xs text-gray-500 font-mono space-y-1">
          {steps.map((step, i) => (
            <p
              key={i}
              className={`transition-colors ${
                progress > step.threshold ? 'text-emerald-600 font-bold' : ''
              }`}
            >
              {progress > step.threshold ? '✓' : '○'} {step.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
