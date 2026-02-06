import { CheckCircle2, Calendar, MessageCircle, ExternalLink } from 'lucide-react'

export default function ResultScreen({ screen, quiz }) {
  const primaryColor = quiz?.branding?.primaryColor || '#4CA994'
  const cta = quiz?.cta || {}
  const config = screen?.config || {}

  function handleCTA() {
    switch (cta.type) {
      case 'calendly':
        if (cta.calendlyUrl) {
          window.open(cta.calendlyUrl, '_blank')
        }
        break
      case 'whatsapp':
        if (cta.whatsappNumber) {
          const message = encodeURIComponent(cta.whatsappMessage || 'Hola, acabo de completar el quiz.')
          window.open(`https://wa.me/${cta.whatsappNumber}?text=${message}`, '_blank')
        }
        break
      case 'redirect':
        if (cta.redirectUrl) {
          window.location.href = cta.redirectUrl
        }
        break
      default:
        break
    }
  }

  const ctaIcons = {
    calendly: Calendar,
    whatsapp: MessageCircle,
    redirect: ExternalLink,
  }
  const CTAIcon = ctaIcons[cta.type] || ExternalLink

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Bar */}
      <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

      <div className="max-w-lg mx-auto p-6 pt-12 md:pt-20 text-center">
        {/* Success Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <CheckCircle2 size={40} style={{ color: primaryColor }} />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {screen?.title || '¡Gracias!'}
        </h1>

        {/* Subtitle */}
        {screen?.subtitle && (
          <p className="text-gray-500 text-base md:text-lg mb-8 max-w-md mx-auto">
            {screen.subtitle}
          </p>
        )}

        {/* CTA Button */}
        {cta.type && cta.type !== 'none' && (
          <button
            onClick={handleCTA}
            className="w-full md:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto"
            style={{ backgroundColor: primaryColor }}
          >
            <CTAIcon size={20} />
            {cta.buttonText || 'Continuar'}
          </button>
        )}

        {/* Additional Info */}
        {config.additionalInfo && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">{config.additionalInfo}</p>
          </div>
        )}

        {/* Contact Info */}
        {config.contactInfo && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 mb-2">¿Tienes preguntas?</p>
            <p className="text-sm text-gray-600">{config.contactInfo}</p>
          </div>
        )}

        {/* Social Proof */}
        {config.socialProof && (
          <div className="mt-12 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">
              {config.socialProofTitle || 'Miles de clientes satisfechos'}
            </p>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5"
                  fill={primaryColor}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
