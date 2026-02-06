// PostHog Analytics Service
// Tracks all quiz events for funnel analysis and A/B testing

import posthog from 'posthog-js';

let isInitialized = false;

// Initialize PostHog
export function initPostHog() {
  if (isInitialized) return;

  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

  if (!apiKey) {
    console.warn('[Analytics] PostHog API key not found. Analytics disabled.');
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage',
    // Enable session recording
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
      },
    },
  });

  isInitialized = true;
  console.log('[Analytics] PostHog initialized');
}

// Get or create a session ID for this quiz session
export function getSessionId() {
  let sessionId = sessionStorage.getItem('quiz_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('quiz_session_id', sessionId);
  }
  return sessionId;
}

// Identify user (after lead capture)
export function identifyUser(userId, properties = {}) {
  if (!isInitialized) return;
  posthog.identify(userId, properties);
}

// Track generic event
export function trackEvent(eventName, properties = {}) {
  if (!isInitialized) {
    console.log(`[Analytics Mock] ${eventName}`, properties);
    return;
  }

  posthog.capture(eventName, {
    ...properties,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// QUIZ SPECIFIC EVENTS
// ============================================

// Quiz lifecycle events
export function trackQuizView(quizId, quizName, variant = null) {
  trackEvent('quiz_viewed', {
    quiz_id: quizId,
    quiz_name: quizName,
    variant: variant,
  });
}

export function trackQuizStarted(quizId, quizName, variant = null) {
  trackEvent('quiz_started', {
    quiz_id: quizId,
    quiz_name: quizName,
    variant: variant,
  });
}

export function trackQuizCompleted(quizId, answers, totalQuestions) {
  trackEvent('quiz_completed', {
    quiz_id: quizId,
    answers: answers,
    total_questions: totalQuestions,
    completion_time_seconds: getSessionDuration(),
  });
}

export function trackQuizAbandoned(quizId, lastStep, totalSteps) {
  trackEvent('quiz_abandoned', {
    quiz_id: quizId,
    last_step: lastStep,
    total_steps: totalSteps,
    completion_percentage: Math.round((lastStep / totalSteps) * 100),
  });
}

// Question events
export function trackQuestionViewed(quizId, questionId, questionIndex, totalQuestions) {
  trackEvent('question_viewed', {
    quiz_id: quizId,
    question_id: questionId,
    question_index: questionIndex,
    total_questions: totalQuestions,
    progress_percentage: Math.round((questionIndex / totalQuestions) * 100),
  });
}

export function trackQuestionAnswered(quizId, questionId, questionIndex, answer, timeSpentMs = null) {
  trackEvent('question_answered', {
    quiz_id: quizId,
    question_id: questionId,
    question_index: questionIndex,
    answer: answer,
    time_spent_ms: timeSpentMs,
  });
}

export function trackBackButtonClicked(quizId, fromStep, toStep) {
  trackEvent('back_button_clicked', {
    quiz_id: quizId,
    from_step: fromStep,
    to_step: toStep,
  });
}

// Analysis/Loading events
export function trackAnalysisStarted(quizId, answers) {
  trackEvent('analysis_started', {
    quiz_id: quizId,
    answers: answers,
  });
}

export function trackAnalysisCompleted(quizId, result, score = null) {
  trackEvent('analysis_completed', {
    quiz_id: quizId,
    result: result,
    score: score,
  });
}

// Lead form events
export function trackFormViewed(quizId) {
  trackEvent('lead_form_viewed', {
    quiz_id: quizId,
  });
}

export function trackFormFieldFocused(quizId, fieldName, fieldOrder) {
  trackEvent('form_field_focused', {
    quiz_id: quizId,
    field_name: fieldName,
    field_order: fieldOrder,
  });
}

export function trackFormFieldCompleted(quizId, fieldName) {
  trackEvent('form_field_completed', {
    quiz_id: quizId,
    field_name: fieldName,
  });
}

export function trackFormSubmitted(quizId, leadData, answers) {
  // Calculate lead score based on answers
  const leadScore = calculateLeadScore(answers);

  trackEvent('lead_form_submitted', {
    quiz_id: quizId,
    lead_score: leadScore,
    has_name: !!leadData.name,
    has_email: !!leadData.email,
    has_phone: !!leadData.phone,
    consent_given: leadData.consent,
  });

  // Identify the user for future tracking
  if (leadData.email) {
    identifyUser(leadData.email, {
      name: leadData.name,
      phone: leadData.phone,
      lead_score: leadScore,
      quiz_answers: answers,
    });
  }

  return leadScore;
}

export function trackFormError(quizId, errorType, fieldName = null) {
  trackEvent('form_error', {
    quiz_id: quizId,
    error_type: errorType,
    field_name: fieldName,
  });
}

// Conversion events
export function trackConversion(quizId, conversionType, value = null) {
  trackEvent('conversion', {
    quiz_id: quizId,
    conversion_type: conversionType, // 'calendly_booked', 'whatsapp_clicked', 'phone_call', etc.
    value: value,
  });
}

export function trackCalendlyOpened(quizId) {
  trackEvent('calendly_opened', { quiz_id: quizId });
}

export function trackCalendlyBooked(quizId, eventData = {}) {
  trackEvent('calendly_booked', {
    quiz_id: quizId,
    ...eventData,
  });
  trackConversion(quizId, 'calendly_booked');
}

export function trackWhatsAppClicked(quizId, phoneNumber) {
  trackEvent('whatsapp_clicked', {
    quiz_id: quizId,
    phone_number: phoneNumber,
  });
  trackConversion(quizId, 'whatsapp_clicked');
}

// A/B Testing
export function trackExperimentViewed(experimentId, variantId) {
  trackEvent('experiment_viewed', {
    experiment_id: experimentId,
    variant_id: variantId,
  });
}

export function trackExperimentConverted(experimentId, variantId, conversionType) {
  trackEvent('experiment_converted', {
    experiment_id: experimentId,
    variant_id: variantId,
    conversion_type: conversionType,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate lead score based on quiz answers
function calculateLeadScore(answers) {
  let score = 0;

  // Urgency scoring
  const urgency = answers.urgency;
  if (urgency === 'Lo antes posible') score += 30;
  else if (urgency === 'En los próximos 3 meses') score += 25;
  else if (urgency === 'En 6 meses o más') score += 15;
  else if (urgency === 'Solo me estoy informando') score += 5;

  // Age scoring (prime candidates)
  const age = answers.age;
  if (age === '25 - 35 años' || age === '36 - 45 años') score += 25;
  else if (age === '46 - 55 años') score += 20;
  else if (age === 'Menos de 25 años') score += 10;
  else score += 15;

  // Timeline scoring (stable = better candidate)
  const timeline = answers.timeline;
  if (timeline === 'Más de 5 años (Estable)') score += 25;
  else if (timeline === 'Entre 1 y 5 años (Progresiva)') score += 20;
  else if (timeline === 'Menos de 1 año (Reciente)') score += 10;
  else score += 15;

  // Genetics scoring
  const genetics = answers.genetics;
  if (genetics === 'Sí, padre o madre') score += 15;
  else if (genetics === 'Sí, abuelos o tíos') score += 10;
  else score += 5;

  // Normalize to 0-100
  return Math.min(100, Math.max(0, score));
}

// Get session duration in seconds
function getSessionDuration() {
  const startTime = sessionStorage.getItem('quiz_start_time');
  if (!startTime) return 0;
  return Math.round((Date.now() - parseInt(startTime)) / 1000);
}

// Set quiz start time
export function setQuizStartTime() {
  sessionStorage.setItem('quiz_start_time', Date.now().toString());
}

// Reset session
export function resetSession() {
  sessionStorage.removeItem('quiz_session_id');
  sessionStorage.removeItem('quiz_start_time');
}

// Export posthog instance for advanced usage
export { posthog };

// Default export for convenience
export default {
  init: initPostHog,
  track: trackEvent,
  identify: identifyUser,
};
