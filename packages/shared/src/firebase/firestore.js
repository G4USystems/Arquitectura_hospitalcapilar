import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// QUIZZES
// ============================================

export async function createQuiz(userId, quizData) {
  const quizzesRef = collection(db, 'quizzes');
  const newQuiz = {
    userId,
    campaignId: quizData.campaignId || null,
    name: quizData.name || 'Nuevo Quiz',
    slug: quizData.slug || `quiz-${Date.now()}`,
    status: 'draft',
    branding: {
      primaryColor: '#2563EB',
      backgroundColor: '#F8FAFC',
      logoUrl: null,
      ...quizData.branding,
    },
    settings: {
      showProgressBar: true,
      allowBack: true,
      requireConsent: true,
      ...quizData.settings,
    },
    cta: {
      type: 'calendly', // calendly, whatsapp, redirect, none
      calendlyUrl: null,
      whatsappNumber: null,
      redirectUrl: null,
      buttonText: 'Agendar Cita',
      ...quizData.cta,
    },
    stats: {
      totalViews: 0,
      totalStarts: 0,
      totalCompletes: 0,
      totalLeads: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(quizzesRef, newQuiz);
  return { id: docRef.id, ...newQuiz };
}

export async function getQuiz(quizId) {
  const quizRef = doc(db, 'quizzes', quizId);
  const quizSnap = await getDoc(quizRef);

  if (quizSnap.exists()) {
    return { id: quizSnap.id, ...quizSnap.data() };
  }
  return null;
}

export async function getQuizBySlug(slug, { publishedOnly = true } = {}) {
  const quizzesRef = collection(db, 'quizzes');
  const constraints = [where('slug', '==', slug)];
  if (publishedOnly) constraints.push(where('status', '==', 'published'));
  const q = query(quizzesRef, ...constraints, limit(1));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  return null;
}

export async function getUserQuizzes(userId) {
  const quizzesRef = collection(db, 'quizzes');
  const q = query(quizzesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function getCampaignQuizzes(campaignId) {
  const quizzesRef = collection(db, 'quizzes');
  const q = query(quizzesRef, where('campaignId', '==', campaignId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function updateQuiz(quizId, data) {
  const quizRef = doc(db, 'quizzes', quizId);
  await updateDoc(quizRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuiz(quizId) {
  // Delete all screens first
  const screensRef = collection(db, 'quizzes', quizId, 'screens');
  const screensSnap = await getDocs(screensRef);

  for (const screenDoc of screensSnap.docs) {
    await deleteDoc(screenDoc.ref);
  }

  // Delete quiz
  const quizRef = doc(db, 'quizzes', quizId);
  await deleteDoc(quizRef);
}

export async function publishQuiz(quizId) {
  await updateQuiz(quizId, { status: 'published' });
}

export async function unpublishQuiz(quizId) {
  await updateQuiz(quizId, { status: 'draft' });
}

export async function duplicateQuiz(quizId) {
  // Get the original quiz
  const original = await getQuiz(quizId);
  if (!original) throw new Error('Quiz not found');

  // Create a new quiz with copied data
  const quizzesRef = collection(db, 'quizzes');
  const newQuiz = {
    userId: original.userId,
    campaignId: original.campaignId || null,
    name: `${original.name} (Copia)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    status: 'draft',
    branding: { ...original.branding },
    settings: { ...original.settings },
    cta: { ...original.cta },
    flow: original.flow || null,
    decisionTree: original.decisionTree || null,
    stats: {
      totalViews: 0,
      totalStarts: 0,
      totalCompletes: 0,
      totalLeads: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(quizzesRef, newQuiz);

  // Copy all screens
  const screens = await getScreens(quizId);
  for (const screen of screens) {
    await createScreen(docRef.id, {
      type: screen.type,
      title: screen.title,
      subtitle: screen.subtitle,
      options: screen.options,
      config: screen.config,
    });
  }

  return docRef.id;
}

// ============================================
// SCREENS (subcollection of quizzes)
// ============================================

export async function createScreen(quizId, screenData) {
  const screensRef = collection(db, 'quizzes', quizId, 'screens');

  // Get current screen count for order
  const existingScreens = await getDocs(screensRef);
  const order = existingScreens.size;

  const newScreen = {
    order,
    type: screenData.type || 'single_choice',
    title: screenData.title || '',
    subtitle: screenData.subtitle || '',
    options: screenData.options || [],
    config: screenData.config || {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(screensRef, newScreen);
  return { id: docRef.id, ...newScreen };
}

export async function getScreens(quizId) {
  const screensRef = collection(db, 'quizzes', quizId, 'screens');
  const q = query(screensRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateScreen(quizId, screenId, data) {
  const screenRef = doc(db, 'quizzes', quizId, 'screens', screenId);
  await updateDoc(screenRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteScreen(quizId, screenId) {
  const screenRef = doc(db, 'quizzes', quizId, 'screens', screenId);
  await deleteDoc(screenRef);
}

export async function reorderScreens(quizId, screenIds) {
  for (let i = 0; i < screenIds.length; i++) {
    const screenRef = doc(db, 'quizzes', quizId, 'screens', screenIds[i]);
    await updateDoc(screenRef, { order: i });
  }
}

// ============================================
// LEADS
// ============================================

export async function createLead(leadData) {
  const leadsRef = collection(db, 'leads');

  const newLead = {
    quizId: leadData.quizId,
    userId: leadData.userId, // Quiz owner
    name: leadData.name || '',
    email: leadData.email || '',
    phone: leadData.phone || '',
    consent: leadData.consent || false,
    answers: leadData.answers || {},
    leadScore: leadData.leadScore || 0,
    sessionId: leadData.sessionId || null,
    source: {
      referrer: leadData.referrer || 'direct',
      utm_source: leadData.utm_source || null,
      utm_medium: leadData.utm_medium || null,
      utm_campaign: leadData.utm_campaign || null,
    },
    status: 'new', // new, contacted, converted
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(leadsRef, newLead);

  // Update quiz stats
  if (leadData.quizId) {
    const quizRef = doc(db, 'quizzes', leadData.quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      const stats = quizSnap.data().stats || {};
      await updateDoc(quizRef, {
        'stats.totalLeads': (stats.totalLeads || 0) + 1,
      });
    }
  }

  return { id: docRef.id, ...newLead };
}

export async function getLeads(userId, filters = {}) {
  const leadsRef = collection(db, 'leads');
  let q;

  if (filters.quizId) {
    q = query(leadsRef,
      where('userId', '==', userId),
      where('quizId', '==', filters.quizId)
    );
  } else {
    q = query(leadsRef, where('userId', '==', userId));
  }

  const snapshot = await getDocs(q);
  let results = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  if (filters.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

export async function updateLeadStatus(leadId, status) {
  const leadRef = doc(db, 'leads', leadId);
  await updateDoc(leadRef, { status });
}

// ============================================
// INTEGRATIONS
// ============================================

export async function createIntegration(quizId, userId, integrationType, config = {}) {
  const integrationsRef = collection(db, 'integrations');

  const newIntegration = {
    quizId,
    userId,
    type: integrationType, // google_analytics, meta_pixel, webhook
    enabled: true,
    config,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(integrationsRef, newIntegration);
  return { id: docRef.id, ...newIntegration };
}

export async function getIntegrations(quizId) {
  const integrationsRef = collection(db, 'integrations');
  const q = query(integrationsRef, where('quizId', '==', quizId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateIntegration(integrationId, data) {
  const integrationRef = doc(db, 'integrations', integrationId);
  await updateDoc(integrationRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteIntegration(integrationId) {
  const integrationRef = doc(db, 'integrations', integrationId);
  await deleteDoc(integrationRef);
}

// ============================================
// CAMPAIGNS
// ============================================

export async function createCampaign(userId, campaignData) {
  const campaignsRef = collection(db, 'campaigns');
  const newCampaign = {
    userId,
    name: campaignData.name || 'Nueva Campaña',
    description: campaignData.description || '',
    domain: campaignData.domain || '',
    status: 'active', // active, paused, archived
    quizIds: campaignData.quizIds || [],
    stats: {
      totalViews: 0,
      totalLeads: 0,
      totalConversions: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(campaignsRef, newCampaign);
  return { id: docRef.id, ...newCampaign };
}

export async function getCampaign(campaignId) {
  const campaignRef = doc(db, 'campaigns', campaignId);
  const campaignSnap = await getDoc(campaignRef);

  if (campaignSnap.exists()) {
    return { id: campaignSnap.id, ...campaignSnap.data() };
  }
  return null;
}

export async function getUserCampaigns(userId) {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function updateCampaign(campaignId, data) {
  const campaignRef = doc(db, 'campaigns', campaignId);
  await updateDoc(campaignRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCampaign(campaignId) {
  const campaignRef = doc(db, 'campaigns', campaignId);
  await deleteDoc(campaignRef);
}

export async function addQuizToCampaign(campaignId, quizId) {
  const campaign = await getCampaign(campaignId);
  if (campaign && !campaign.quizIds.includes(quizId)) {
    await updateCampaign(campaignId, {
      quizIds: [...campaign.quizIds, quizId],
    });
  }
}

export async function removeQuizFromCampaign(campaignId, quizId) {
  const campaign = await getCampaign(campaignId);
  if (campaign) {
    await updateCampaign(campaignId, {
      quizIds: campaign.quizIds.filter(id => id !== quizId),
    });
  }
}

// ============================================
// EXPERIMENTS (A/B Testing)
// ============================================

export async function createExperiment(userId, experimentData) {
  const experimentsRef = collection(db, 'experiments');
  const newExperiment = {
    userId,
    name: experimentData.name || 'Nuevo Experimento',
    description: experimentData.description || '',
    status: 'draft', // draft, running, paused, completed
    campaignId: experimentData.campaignId || null,
    variants: [
      {
        id: 'A',
        name: 'Variante A (Control)',
        quizId: experimentData.variantAQuizId || null,
        trafficPercent: 50,
      },
      {
        id: 'B',
        name: 'Variante B',
        quizId: experimentData.variantBQuizId || null,
        trafficPercent: 50,
      },
    ],
    metrics: {
      variantA: {
        visitors: 0,
        starts: 0,
        completes: 0,
        leads: 0,
        conversions: 0,
      },
      variantB: {
        visitors: 0,
        starts: 0,
        completes: 0,
        leads: 0,
        conversions: 0,
      },
    },
    winner: null, // null, 'A', 'B'
    confidenceLevel: null,
    startedAt: null,
    endedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(experimentsRef, newExperiment);
  return { id: docRef.id, ...newExperiment };
}

export async function getExperiment(experimentId) {
  const experimentRef = doc(db, 'experiments', experimentId);
  const experimentSnap = await getDoc(experimentRef);

  if (experimentSnap.exists()) {
    return { id: experimentSnap.id, ...experimentSnap.data() };
  }
  return null;
}

export async function getUserExperiments(userId) {
  const experimentsRef = collection(db, 'experiments');
  const q = query(experimentsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function updateExperiment(experimentId, data) {
  const experimentRef = doc(db, 'experiments', experimentId);
  await updateDoc(experimentRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExperiment(experimentId) {
  const experimentRef = doc(db, 'experiments', experimentId);
  await deleteDoc(experimentRef);
}

export async function startExperiment(experimentId) {
  await updateExperiment(experimentId, {
    status: 'running',
    startedAt: serverTimestamp(),
  });
}

export async function pauseExperiment(experimentId) {
  await updateExperiment(experimentId, {
    status: 'paused',
  });
}

export async function completeExperiment(experimentId, winner) {
  await updateExperiment(experimentId, {
    status: 'completed',
    winner,
    endedAt: serverTimestamp(),
  });
}

export async function updateExperimentMetrics(experimentId, variant, metrics) {
  const experiment = await getExperiment(experimentId);
  if (experiment) {
    const metricsKey = variant === 'A' ? 'metrics.variantA' : 'metrics.variantB';
    await updateExperiment(experimentId, {
      [metricsKey]: {
        ...experiment.metrics[variant === 'A' ? 'variantA' : 'variantB'],
        ...metrics,
      },
    });
  }
}

// Get which variant to show for a visitor (for A/B testing)
export function getExperimentVariant(experiment) {
  if (!experiment || experiment.status !== 'running') {
    return null;
  }

  const random = Math.random() * 100;
  const variantA = experiment.variants[0];

  if (random < variantA.trafficPercent) {
    return 'A';
  }
  return 'B';
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToQuiz(quizId, callback) {
  const quizRef = doc(db, 'quizzes', quizId);
  return onSnapshot(quizRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
}

export function subscribeToScreens(quizId, callback) {
  const screensRef = collection(db, 'quizzes', quizId, 'screens');
  const q = query(screensRef, orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const screens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(screens);
  });
}

export function subscribeToExperiment(experimentId, callback) {
  const experimentRef = doc(db, 'experiments', experimentId);
  return onSnapshot(experimentRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
}

export { db };
