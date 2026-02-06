// Firebase module - barrel export
export { app, auth, db } from './config';

export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  getUserData,
  onAuthChange,
} from './auth';

export {
  // Quizzes
  createQuiz,
  getQuiz,
  getQuizBySlug,
  getUserQuizzes,
  getCampaignQuizzes,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  duplicateQuiz,
  // Screens
  createScreen,
  getScreens,
  updateScreen,
  deleteScreen,
  reorderScreens,
  // Leads
  createLead,
  getLeads,
  updateLeadStatus,
  // Integrations
  createIntegration,
  getIntegrations,
  updateIntegration,
  deleteIntegration,
  // Campaigns
  createCampaign,
  getCampaign,
  getUserCampaigns,
  updateCampaign,
  deleteCampaign,
  addQuizToCampaign,
  removeQuizFromCampaign,
  // Experiments (A/B Testing)
  createExperiment,
  getExperiment,
  getUserExperiments,
  updateExperiment,
  deleteExperiment,
  startExperiment,
  pauseExperiment,
  completeExperiment,
  updateExperimentMetrics,
  getExperimentVariant,
  // Realtime
  subscribeToQuiz,
  subscribeToScreens,
  subscribeToExperiment,
} from './firestore';
