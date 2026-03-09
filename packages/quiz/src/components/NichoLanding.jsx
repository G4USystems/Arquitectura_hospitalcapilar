import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Stethoscope, CheckCircle2, Users, Star, ArrowRight } from 'lucide-react';
import { useAnalytics } from '@hospital-capilar/shared/analytics';

// ============================================
// NICHO CONFIGURATIONS
// ============================================
const NICHOS = {
  mujeres: {
    slug: 'mujeres',
    badge: 'Especialistas en Alopecia Femenina',
    headline: (
      <>
        ¿Tu pelo pierde densidad y<br />
        <span className="text-[#4CA994]">nadie te da una respuesta clara?</span>
      </>
    ),
    subheadline: 'El 40% de las mujeres sufre pérdida de pelo. La mayoría recibe un diagnóstico genérico. Nosotros cruzamos tu perfil hormonal con un estudio capilar completo para encontrar la causa real.',
    cta: 'Descubre qué le pasa a tu pelo',
    stats: [
      { value: '40%', label: 'de mujeres sufren caída capilar' },
      { value: '80%', label: 'mal diagnosticadas la primera vez' },
      { value: '30 min', label: 'diagnóstico integral completo' },
    ],
    testimonials: [
      { name: 'Laura M.', age: 34, text: 'Llevaba 2 años con caída y nadie encontraba la causa. En Hospital Capilar descubrieron que era hormonal. Ahora estoy recuperando densidad.', stars: 5 },
      { name: 'Patricia G.', age: 41, text: 'Después del embarazo no paraba de caer. Me hicieron una analítica completa cruzada con tricoscopía. Por fin un diagnóstico real.', stars: 5 },
    ],
    painPoints: [
      '¿Notas que se te ve el cuero cabelludo?',
      '¿Llevas meses (o años) probando champús y suplementos sin resultado?',
      '¿Te dijeron que "es normal" pero tú sabes que no lo es?',
      '¿Crees que puede ser hormonal pero nadie lo ha evaluado?',
    ],
    solution: 'En Hospital Capilar somos el único centro que cruza dermatología capilar con endocrinología. Porque tu pelo y tus hormonas están conectados — y nadie los mira juntos.',
  },

  jovenes: {
    slug: 'jovenes',
    badge: 'Alopecia Temprana: Actúa Antes',
    headline: (
      <>
        ¿Notas que tus entradas<br />
        <span className="text-[#4CA994]">retroceden antes de tiempo?</span>
      </>
    ),
    subheadline: 'La alopecia a los 18-28 años es más común de lo que piensas. Y cuanto antes actúes, más pelo conservas. No esperes a que sea tarde — un diagnóstico a tiempo cambia todo.',
    cta: 'Evalúa tu caso en 3 minutos',
    stats: [
      { value: '25%', label: 'de hombres notan caída antes de los 25' },
      { value: '95%', label: 'de éxito si se trata a tiempo' },
      { value: '3 min', label: 'para saber dónde estás' },
    ],
    testimonials: [
      { name: 'Alejandro R.', age: 22, text: 'Empecé a notar las entradas a los 20. Me dijeron que era genético y no había nada que hacer. En HC me explicaron todas las opciones reales.', stars: 5 },
      { name: 'Daniel P.', age: 26, text: 'No quería acabar como mi padre. Fui a tiempo, me hicieron un diagnóstico completo y ahora tengo un plan que funciona.', stars: 5 },
    ],
    painPoints: [
      '¿Las entradas cada vez más atrás?',
      '¿Tu padre o abuelo perdió el pelo y temes que te pase igual?',
      '¿Has buscado en internet pero no sabes qué es fiable?',
      '¿Te da cosa ir a una clínica porque crees que te van a vender algo?',
    ],
    solution: 'En Hospital Capilar no vendemos cirugías a jóvenes que no las necesitan. Primero diagnosticamos con microscopio + analítica. Después te explicamos todas las opciones reales — sin presión.',
  },

  'hombres-caida': {
    slug: 'hombres-caida',
    badge: 'Diagnostico Capilar Avanzado',
    headline: (
      <>
        ¿Llevas tiempo con caida y<br />
        <span className="text-[#4CA994]">nada de lo que pruebas funciona?</span>
      </>
    ),
    subheadline: 'El 60% de hombres que usan minoxidil no ven resultados. No porque el producto no sirva — sino porque nunca les diagnosticaron correctamente la causa de su caida.',
    cta: 'Descubre por que no funciona',
    stats: [
      { value: '60%', label: 'no responden a minoxidil sin diagnostico' },
      { value: '20+', label: 'tipos de alopecia con tratamientos distintos' },
      { value: '195€', label: 'consulta diagnostica completa' },
    ],
    testimonials: [
      { name: 'Carlos M.', age: 38, text: 'Llevaba 3 anos con minoxidil y finasteride sin resultado. En HC descubrieron que mi alopecia era mixta. Cambiaron el tratamiento y en 6 meses note la diferencia.', stars: 5 },
      { name: 'Javier L.', age: 45, text: 'Me opere en Turquia y el pelo seguia cayendo. En Hospital Capilar me disenaron un plan de mantenimiento que protege mi inversion.', stars: 5 },
    ],
    painPoints: [
      '¿Minoxidil, finasteride, champus... y sigue cayendo?',
      '¿Llevas mas de un ano perdiendo densidad?',
      '¿Te han dado recetas genericas sin hacerte un estudio completo?',
      '¿No sabes si necesitas tratamiento medico o cirugia?',
    ],
    solution: 'En Hospital Capilar hacemos lo que nadie hace: un diagnostico integral con tricoscopia + analitica hormonal + valoracion medica en 30 minutos. Porque sin diagnostico correcto, cualquier tratamiento es una apuesta.',
  },

  'segunda-opinion': {
    slug: 'segunda-opinion',
    badge: 'Segunda Opinion Capilar',
    headline: (
      <>
        ¿Tuviste una mala experiencia<br />
        <span className="text-[#4CA994]">en otra clinica capilar?</span>
      </>
    ),
    subheadline: 'Sabemos que hay clinicas que prometen mucho y entregan poco. Hospital Capilar es un centro medico, no un centro estetico. Aqui no hay consultas gratuitas que son ventas disfrazadas.',
    cta: 'Evalua tu caso sin compromiso',
    stats: [
      { value: '35%', label: 'de pacientes vienen de otra clinica' },
      { value: '0', label: 'presion comercial en la consulta' },
      { value: '100%', label: 'transparencia con tu diagnostico' },
    ],
    testimonials: [
      { name: 'Miguel A.', age: 42, text: 'Me operaron en otra clinica y el resultado fue desastroso. En HC me explicaron por que fallo y que opciones reales tenia. Por primera vez senti que alguien me decia la verdad.', stars: 5 },
      { name: 'Roberto S.', age: 35, text: 'Fui a 3 clinicas antes. Todas me vendian lo mismo sin hacerme un estudio serio. En Hospital Capilar me hicieron tricoscopia, analitica y me explicaron todo con datos.', stars: 5 },
    ],
    painPoints: [
      '¿Te prometieron resultados que nunca llegaron?',
      '¿Sientes que te vendieron un tratamiento sin diagnosticarte bien?',
      '¿Desconfias de las clinicas capilares despues de tu experiencia?',
      '¿Necesitas una opinion medica real, sin compromiso ni presion?',
    ],
    solution: 'En Hospital Capilar no hacemos consultas comerciales. Nuestros medicos te diagnostican con datos (tricoscopia + analitica) y te dicen la verdad sobre tu caso, te guste o no. Si no podemos ayudarte, te lo decimos.',
  },

  'post-trasplante': {
    slug: 'post-trasplante',
    badge: 'Mantenimiento Post-Trasplante',
    headline: (
      <>
        Ya te operaste.<br />
        <span className="text-[#4CA994]">¿Quien protege tu inversion?</span>
      </>
    ),
    subheadline: 'Un trasplante capilar sin plan de mantenimiento pierde resultados con el tiempo. El pelo trasplantado no se cae, pero el pelo nativo sigue sometido a los mismos factores que causaron la caida original.',
    cta: 'Protege tu trasplante',
    stats: [
      { value: '40%', label: 'pierden resultados sin mantenimiento' },
      { value: '12 meses', label: 'criticos post-cirugia' },
      { value: '3.000€+', label: 'invertidos que hay que proteger' },
    ],
    testimonials: [
      { name: 'Fernando G.', age: 39, text: 'Me opere en Turquia hace 2 anos. El trasplante se ve bien, pero el resto del pelo seguia cayendo. En HC me disenaron un plan de mantenimiento y ahora tengo todo controlado.', stars: 5 },
      { name: 'Andres M.', age: 44, text: 'Me opere en HC y el seguimiento post-operatorio es otro nivel. Tricoscopia cada 6 meses, tratamiento personalizado, y siempre disponibles para cualquier duda.', stars: 5 },
    ],
    painPoints: [
      '¿Te operaste pero el pelo nativo sigue cayendo?',
      '¿No tienes un plan de mantenimiento post-trasplante?',
      '¿Tu clinica no te hizo seguimiento despues de la cirugia?',
      '¿Quieres que los resultados de tu trasplante duren para siempre?',
    ],
    solution: 'En Hospital Capilar diseñamos planes de mantenimiento personalizados que protegen tanto el pelo trasplantado como el nativo. Tricoscopia de control + tratamiento medico adaptado a tu caso.',
  },

  postparto: {
    slug: 'postparto',
    badge: 'Caida Capilar Postparto',
    headline: (
      <>
        ¿Se te cae el pelo<br />
        <span className="text-[#4CA994]">desde el embarazo o el parto?</span>
      </>
    ),
    subheadline: 'El efluvio postparto afecta al 50% de madres. En la mayoria de casos es temporal, pero en algunas mujeres revela una alopecia subyacente que necesita tratamiento. La unica forma de saberlo es con un diagnostico.',
    cta: 'Descubre si es temporal o algo mas',
    stats: [
      { value: '50%', label: 'de madres sufren caida postparto' },
      { value: '85%', label: 'se recuperan con tratamiento adecuado' },
      { value: '6 meses', label: 'clave para actuar a tiempo' },
    ],
    testimonials: [
      { name: 'Elena R.', age: 32, text: 'Despues del parto perdi mucho pelo. Mi ginecologa decia que era normal. En HC descubrieron que tenia AGA subyacente. Gracias a actuar a tiempo estoy recuperando densidad.', stars: 5 },
      { name: 'Sofia T.', age: 29, text: 'Creia que nunca iba a volver a tener mi pelo de antes. El diagnostico en HC me tranquilizo: era efluvio temporal. Me dieron un plan y en 4 meses estaba como antes.', stars: 5 },
    ],
    painPoints: [
      '¿Pierdes mechones de pelo desde que diste a luz?',
      '¿Te dijeron que es normal pero llevas meses asi?',
      '¿No sabes si es temporal o algo mas serio?',
      '¿Te preocupa que no vuelva a crecer como antes?',
    ],
    solution: 'En Hospital Capilar cruzamos tu perfil hormonal postparto con un estudio capilar completo. Si es efluvio temporal, te lo decimos y te ahorras preocupaciones. Si hay una alopecia subyacente, actuamos a tiempo.',
  },
};

// ============================================
// LANDING PAGE COMPONENT
// ============================================
const NichoLanding = ({ nicho }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analytics = useAnalytics();
  const config = NICHOS[nicho];

  if (!config) return null;

  // Navigate to /{nicho}/quiz preserving UTMs
  const startQuiz = () => {
    const params = new URLSearchParams(searchParams);
    analytics.trackEvent('landing_cta_clicked', {
      nicho,
      utm_source: searchParams.get('utm_source') || 'direct',
    });
    const qs = params.toString();
    navigate(`/${nicho}/quiz${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Top bar */}
      <div className="h-1.5 w-full bg-[#4CA994]" />

      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <img src="/logo-hc.svg" alt="Hospital Capilar" className="h-12" />
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <ShieldCheck size={16} className="text-[#4CA994]" />
          Centro Médico Especializado
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="bg-[#E6F0F0] text-[#2E4C4C] px-4 py-1.5 rounded-full text-sm font-bold mb-8 inline-flex items-center gap-2">
          <Stethoscope size={16} />
          {config.badge}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          {config.headline}
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {config.subheadline}
        </p>

        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all bg-[#4CA994]"
        >
          {config.cta}
          <ArrowRight size={22} />
        </button>

        <p className="text-sm text-gray-400 mt-4">3-4 minutos | 100% confidencial | Sin compromiso</p>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {config.stats.map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-extrabold text-[#4CA994] mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 text-center">
          ¿Te identificas con esto?
        </h2>
        <div className="space-y-4">
          {config.painPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <CheckCircle2 size={24} className="text-[#4CA994] shrink-0 mt-0.5" />
              <p className="text-lg text-gray-700 font-medium">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="bg-[#F0F7F6] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            ¿Por qué Hospital Capilar es diferente?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            {config.solution}
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <Stethoscope size={28} className="text-[#4CA994] mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Diagnóstico real</h3>
              <p className="text-sm text-gray-500">Tricoscopía + analítica hormonal + valoración médica en 30 minutos.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <Users size={28} className="text-[#4CA994] mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Equipo médico</h3>
              <p className="text-sm text-gray-500">Dermatólogos, tricólogos y endocrinólogos trabajando juntos en tu caso.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <ShieldCheck size={28} className="text-[#4CA994] mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Sin presión</h3>
              <p className="text-sm text-gray-500">Te decimos la verdad sobre tu caso. Si no necesitas tratamiento, te lo decimos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Personas como tú que dieron el paso
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {config.testimonials.map((t, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-4 italic">"{t.text}"</p>
              <p className="text-sm font-bold text-gray-900">{t.name}, {t.age} años</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#2C3E50] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            El primer paso es saber dónde estás
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Responde nuestro diagnóstico interactivo y recibe un pre-diagnóstico personalizado en minutos.
          </p>
          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all bg-[#4CA994]"
          >
            {config.cta}
            <ArrowRight size={22} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <img src="/logo-hc.svg" alt="Hospital Capilar" className="h-8 opacity-40" />
          <div className="flex gap-6 text-sm text-gray-400">
            <span>Madrid</span>
            <span>Murcia</span>
            <span>Pontevedra</span>
          </div>
          <p className="text-xs text-gray-400">Centro Médico Especializado en Salud Capilar</p>
        </div>
      </footer>
    </div>
  );
};

export default NichoLanding;
