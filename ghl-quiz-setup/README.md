# Quiz Hospital Capilar — Guía de Implementación en GoHighLevel

## Arquitectura del Quiz en GHL

### Mapeo de conceptos

| Tu quiz (React) | GHL nativo |
|---|---|
| 6 ECPs (perfiles de paciente) | **6 Categorías** |
| Lead Score (0-100+) | **Puntos por respuesta** |
| 5 Frames (CTAs) | **3 Score Tiers** (Low/Med/High) + Workflows |
| Micro-tips | **No replicable** (usar subtítulos como alternativa) |
| `optionsFn` (opciones dinámicas por sexo) | **2 páginas separadas** + Jump To |
| Copy dinámico con variables | **Texto estático** por categoría ganadora |

---

## Estructura de Páginas (14 páginas)

```
Página 1:  Sexo
Página 2:  Edad
Página 3a: Problema (Hombre) ← Jump To desde P1 si "Hombre"
Página 3b: Problema (Mujer)  ← Jump To desde P1 si "Mujer"
Página 4:  Tiempo
Página 5:  Qué has probado (multiple choice)
Página 6:  Condiciones hormonales (solo mujeres con problemas hormonal/densidad/caida)
Página 7:  Dónde te operaste (solo post-cirugia)
Página 8:  Qué clínica (solo mala-experiencia)
Página 9:  Impacto emocional
Página 10: Conocimiento de tu alopecia
Página 11: Motivación / siguiente paso
Página 12: Efectos secundarios (hombres) / Profesional visitado (mujeres)
Página 13: Expectativa de resultado
Página 14: Inversión mensual
Página 15: Formato preferido
Página 16: Formulario de captura (nombre, email, teléfono, ubicación)
```

---

## Categorías (ECPs) — Crear en GHL

| Categoría | Nombre en GHL | Descripción |
|---|---|---|
| ECP1 | `Hombre tratamiento previo` | Hombre con caída que ya probó tratamientos |
| ECP2 | `Mujer hormonal` | Mujer con caída por causa hormonal |
| ECP3 | `Joven inicio caída` | Hombre 18-25 sin tratamientos previos |
| ECP4 | `Mala experiencia previa` | Ya fue a otra clínica y tuvo mala experiencia |
| ECP5 | `Post-cirugía` | Ya se hizo trasplante, necesita mantenimiento |
| ECP6 | `Postparto` | Mujer con caída desde embarazo/parto |

---

## Score Tiers — Configurar en Results Page

| Tier | Rango | Mapea a Frame | CTA |
|---|---|---|---|
| **High** (71-100%) | Score alto + ciudad operativa | FRAME_A | "Reserva tu Consulta — 195€" + botón Calendly |
| **Medium** (41-70%) | Score medio o formato=llamada | FRAME_C | "Solicita que te llamemos" + botón callback |
| **Low** (0-40%) | Score bajo o formato=info | FRAME_D | "Descarga tu Guía (PDF)" + botón descarga |

> **Nota**: WAITLIST y DERIVACION se manejan via **Workflows** con tags, no en la results page.

---

## Scoring por Pregunta (puntos a asignar en cada opción)

### P1: Sexo
No puntúa directamente (determina flujo condicional)

### P2: Edad
| Opción | Puntos | Categoría |
|---|---|---|
| 18-25 años | 0 | ECP3 (+5) |
| 26-35 años | 3 | — |
| 36-45 años | 3 | — |
| 46-55 años | 2 | — |
| Más de 55 | 1 | — |

### P3a: Problema (Hombre)
| Opción | Puntos | Categoría |
|---|---|---|
| Se me cae / pierdo densidad | 3 | ECP1 (+5) |
| Las entradas retroceden | 3 | ECP1 (+5) |
| Me operé y sigue cayendo | 4 | ECP5 (+10) |
| Mala experiencia en otra clínica | 2 | ECP4 (+10) |
| Problemas cuero cabelludo | 0 | — (DERIVACION via tag) |

### P3b: Problema (Mujer)
| Opción | Puntos | Categoría |
|---|---|---|
| Pierdo densidad | 3 | ECP2 (+5) |
| Desde embarazo/parto | 3 | ECP6 (+10) |
| Hormonal | 3 | ECP2 (+10) |
| Se me cae mucho (estrés) | 2 | ECP2 (+3) |
| Problemas cuero cabelludo | 0 | — (DERIVACION via tag) |

### P4: Tiempo
| Opción | Puntos |
|---|---|
| Menos de 3 meses | 0 |
| 3-12 meses | 2 |
| 1-3 años | 4 |
| Más de 3 años | 6 |

### P5: Qué has probado (multiple choice - los puntos se suman)
| Opción | Puntos |
|---|---|
| Nada todavía | 0 |
| Champú/suplementos | 1 |
| Minoxidil | 3 |
| Finasteride/Dutasteride | 3 |
| Tratamientos en clínica | 4 |
| Trasplante capilar | 5 |
| Otro tratamiento | 1 |

### P9: Impacto emocional
| Opción | Puntos |
|---|---|
| Poco | 1 |
| Bastante | 2 |
| Mucho | 4 |
| Lo que más me preocupa | 4 |

### P10: Conocimiento
| Opción | Puntos |
|---|---|
| Sí, diagnosticado | 1 |
| Creo saberlo | 3 |
| No tengo ni idea | 3 |

### P11: Motivación
| Opción | Puntos |
|---|---|
| Saber qué tengo | 3 |
| Ver resultados de otros | 2 |
| Médico sin presión | 2 |
| Precio razonable | 1 |

### P12a: Efectos secundarios (hombres)
| Opción | Puntos |
|---|---|
| Sí, mucho | 1 |
| Algo, con supervisión | 2 |
| No especialmente | 2 |

### P12b: Profesional visitado (mujeres)
| Opción | Puntos |
|---|---|
| No, primera vez | 2 |
| Dermatólogo | 2 |
| Otra clínica capilar | 3 |
| Médico de cabecera | 1 |

### P13: Expectativa
| Opción | Puntos |
|---|---|
| Frenar la caída | 2 |
| Recuperar densidad | 3 |
| Saber si necesito cirugía | 3 |
| Mantener resultados cirugía | 3 |

### P14: Inversión mensual
| Opción | Puntos |
|---|---|
| Menos de 50€ | 1 |
| 50-150€ | 3 |
| 150-300€ | 4 |
| Lo que sea necesario | 5 |

### P15: Formato preferido
| Opción | Puntos |
|---|---|
| Consulta presencial | 4 |
| Que me llamen | 2 |
| Quiero empezar ya | 5 |
| Necesito más info | 0 |

---

## Jump To Rules (Lógica Condicional)

```
P1 "Hombre" → Jump To P3a (Problema Hombre)
P1 "Mujer"  → Jump To P3b (Problema Mujer)

P3a/P3b → todas van a P4

P5 (después de responder) → Evaluar:
  - Si mujer + problema hormonal/densidad/caida → Jump To P6 (Condiciones)
  - Si problema = post-cirugia → Jump To P7 (Dónde te operaste)
  - Si problema = mala-experiencia → Jump To P8 (Qué clínica)
  - Resto → Jump To P9 (Impacto)

P6/P7/P8 → Jump To P9

P11 → Evaluar:
  - Si hombre → Jump To P12a (Efectos secundarios)
  - Si mujer → Jump To P12b (Profesional visitado)

P12a/P12b → Jump To P13
```

> **Nota**: GHL Quiz Builder soporta Jump To en opciones de tipo "choice". Para las bifurcaciones complejas (P5 → P6/P7/P8), puede que necesites usar páginas intermedias.

---

## Textos de Resultado por Categoría Ganadora

### Si gana ECP1 (Hombre tratamiento previo)
**Título**: "Tu perfil capilar: Tratamiento sin diagnóstico"
**Texto**: "Llevas tiempo tratando tu caída capilar sin los resultados que esperabas. Esto es más común de lo que piensas — el 40-60% de personas no responden a minoxidil. En muchos casos, el problema no es el producto sino que nunca se diagnosticó correctamente la causa. Te recomendamos un diagnóstico integral presencial con microscopio capilar + analítica completa."

### Si gana ECP2 (Mujer hormonal)
**Título**: "Tu perfil capilar: Conexión hormonal"
**Texto**: "Tu caída de pelo está probablemente conectada a un desbalance hormonal que nadie ha evaluado en relación con tu pelo. La caída femenina por causa hormonal es una de las menos diagnosticadas. Te recomendamos una consulta diagnóstica con analítica hormonal completa cruzada con un estudio capilar."

### Si gana ECP3 (Joven inicio caída)
**Título**: "Tu perfil capilar: Detección temprana"
**Texto**: "Estás empezando a notar señales de caída. Actuar temprano es la mejor decisión con la alopecia. Cuanto antes se diagnostica, más opciones tienes. La caída capilar NO se frena sola. Te recomendamos hablar con nuestro equipo para entender tu caso concreto."

### Si gana ECP4 (Mala experiencia)
**Título**: "Tu perfil capilar: Segunda opinión"
**Texto**: "Ya pasaste por una experiencia negativa en otra clínica y entendemos que tengas dudas. Hospital Capilar es un centro médico especializado, no un centro estético. Aquí hay médicos que te diagnostican con datos y te dicen la verdad. Te recomendamos que hables con nosotros sin compromiso."

### Si gana ECP5 (Post-cirugía)
**Título**: "Tu perfil capilar: Protección post-trasplante"
**Texto**: "Un trasplante sin plan de mantenimiento pierde resultados con el tiempo. El pelo trasplantado no se cae, pero el pelo nativo sigue sometido a los mismos factores que causaron la caída. Te recomendamos un diagnóstico para evaluar tu pelo nativo y diseñar un plan de mantenimiento."

### Si gana ECP6 (Postparto)
**Título**: "Tu perfil capilar: Evaluación postparto"
**Texto**: "El efluvio postparto afecta al 50% de madres. En la mayoría es temporal, pero en algunas el embarazo revela una alopecia subyacente que necesita tratamiento. Te recomendamos un diagnóstico que cruce tu perfil hormonal con tu estudio capilar."

---

## CTAs por Score Tier

### High (71-100%) — FRAME_A
- **Botón principal**: "Reserva tu Consulta de Diagnóstico — 195€"
- **Link**: URL de Calendly o booking
- **Botón secundario**: "Prefiero que me llaméis primero"

### Medium (41-70%) — FRAME_C
- **Botón principal**: "Solicita que te llamemos"
- **Link**: URL de formulario de callback o webhook

### Low (0-40%) — FRAME_D
- **Botón principal**: "Descarga tu Guía (PDF)"
- **Link**: URL del PDF descargable

---

## Workflows (Automatizaciones Post-Quiz)

### Trigger: Quiz Submitted

**Workflow 1: DERIVACION (cuero cabelludo)**
- Condición: Respuesta problema = "Problemas cuero cabelludo"
- Acción: Add Tag "DERIVACION" → Email con info dermatológica → No asignar a pipeline

**Workflow 2: WAITLIST (ciudad no operativa)**
- Condición: Ubicación ≠ Madrid, Murcia, Pontevedra
- Acción: Add Tag "WAITLIST" → Email "Te avisamos cuando abramos" → Add to Waitlist pipeline

**Workflow 3: High Score Lead**
- Condición: Score Tier = High
- Acción: Add Tag "HOT_LEAD" → Notificación interna → Asignar a pipeline "Consultas" → SMS/Email follow-up

**Workflow 4: Medium Score Lead**
- Condición: Score Tier = Medium
- Acción: Add Tag "WARM_LEAD" → Email nurturing sequence → Callback reminder

**Workflow 5: Low Score Lead**
- Condición: Score Tier = Low
- Acción: Add Tag "COLD_LEAD" → Enviar guía PDF → Email nurturing lento

---

## Micro-Tips (Alternativa en GHL)

GHL no tiene overlays entre preguntas. Alternativas:

1. **Subtítulos en las preguntas**: Añadir el texto del micro-tip como descripción/subtítulo
2. **Páginas informativas**: Insertar una página solo con texto entre las preguntas clave
3. **Custom CSS**: Estilizar los subtítulos para que se destaquen visualmente

### Textos de micro-tips a incluir como subtítulos:

| Pregunta | Micro-tip (poner como subtítulo) |
|---|---|
| P9 Impacto | "La pérdida de pelo afecta a la autoestima del 75% de las personas que la sufren." |
| P10 Conocimiento | "Existen más de 20 tipos de alopecia con tratamientos distintos." |
| P11 Motivación | "Nuestra primera consulta incluye tricoscopía + analítica hormonal + 30 min con tu médico." |
| P12a Efectos | "Los efectos del finasteride son reversibles. Existen alternativas sin esos efectos." |
| P12b Profesional | "El 80% reciben una receta genérica de minoxidil en menos de 5 min." |
| P14 Inversión | "La mayoría ha gastado 200-1000€ en productos sin diagnóstico previo." |

---

## Custom CSS (Estilo Hospital Capilar)

```css
/* Color principal */
:root {
  --primary: #4CA994;
  --secondary: #2C3E50;
  --light-bg: #F0F7F6;
}

/* Botones */
.quiz-button, .btn-primary {
  background-color: #4CA994 !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  padding: 16px 24px !important;
  font-size: 18px !important;
}

/* Opciones de respuesta */
.quiz-option {
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  padding: 20px !important;
  font-weight: 700 !important;
  font-size: 18px !important;
}

.quiz-option:hover, .quiz-option.selected {
  border-color: #4CA994 !important;
  background-color: #F0F7F6 !important;
}

/* Títulos */
.quiz-title {
  font-size: 28px !important;
  font-weight: 800 !important;
  color: #111827 !important;
}

/* Subtítulos (micro-tips) */
.quiz-description {
  color: #4CA994 !important;
  font-weight: 600 !important;
  font-style: italic !important;
  background: #F0F7F6 !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  border-left: 4px solid #4CA994 !important;
}

/* Progress bar */
.quiz-progress-bar {
  background-color: #4CA994 !important;
}

/* Results page */
.quiz-result-title {
  color: #4CA994 !important;
  font-weight: 800 !important;
}
```

> Pega este CSS en **Quiz Builder > Styles > Custom CSS**
