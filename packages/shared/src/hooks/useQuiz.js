import { useState, useEffect, useCallback } from 'react';
import {
  getQuiz,
  getQuizBySlug,
  getScreens,
  updateQuiz,
  createScreen,
  updateScreen,
  deleteScreen,
  reorderScreens,
  subscribeToQuiz,
  subscribeToScreens,
} from '../firebase/firestore';

// Hook for loading a quiz by ID (for editor)
export function useQuizEditor(quizId) {
  const [quiz, setQuiz] = useState(null);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    // Subscribe to realtime updates
    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubScreens = subscribeToScreens(quizId, (screens) => {
      setScreens(screens);
      setLoading(false);
    });

    return () => {
      unsubQuiz();
      unsubScreens();
    };
  }, [quizId]);

  const saveQuiz = useCallback(async (data) => {
    if (!quizId) return;
    try {
      await updateQuiz(quizId, data);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [quizId]);

  const addScreen = useCallback(async (screenData) => {
    if (!quizId) return;
    try {
      const newScreen = await createScreen(quizId, screenData);
      return newScreen;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [quizId]);

  const saveScreen = useCallback(async (screenId, data) => {
    if (!quizId) return;
    try {
      await updateScreen(quizId, screenId, data);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [quizId]);

  const removeScreen = useCallback(async (screenId) => {
    if (!quizId) return;
    try {
      await deleteScreen(quizId, screenId);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [quizId]);

  const reorder = useCallback(async (screenIds) => {
    if (!quizId) return;
    try {
      await reorderScreens(quizId, screenIds);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [quizId]);

  return {
    quiz,
    screens,
    loading,
    error,
    saveQuiz,
    addScreen,
    saveScreen,
    removeScreen,
    reorderScreens: reorder,
  };
}

// Hook for loading a quiz by slug for preview (read-only, one-time fetch, any status)
export function useQuizPreview(slug) {
  const [quizData, setQuizData] = useState(null);
  const [decisionTree, setDecisionTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const quiz = await getQuizBySlug(slug, { publishedOnly: false });
        if (!quiz) {
          setError('Quiz no encontrado');
          setLoading(false);
          return;
        }

        const screens = await getScreens(quiz.id);

        // Convert to editableData format (same as QuizEditorPage)
        setQuizData({
          slug: quiz.slug,
          name: quiz.name,
          theme: {
            primary: quiz.branding?.primaryColor,
            secondary: quiz.branding?.secondaryColor,
            light: quiz.branding?.lightColor,
          },
          settings: quiz.settings || { showProgressBar: true, allowBack: true },
          cta: quiz.cta || { type: 'none' },
          intro: quiz.intro,
          questions: screens.map(screen => ({
            id: screen.id,
            title: screen.title,
            subtitle: screen.subtitle || '',
            type: screen.type === 'single_choice' ? 'single' : screen.type,
            options: screen.options || [],
            autoAdvanceSeconds: screen.autoAdvanceSeconds,
          })),
          leadForm: quiz.leadForm,
          result: quiz.result,
          analysis: quiz.analysis || {},
        });
        setDecisionTree(quiz.decisionTree || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  return { quizData, decisionTree, loading, error };
}

// Hook for loading a published quiz by slug (for public quiz)
export function useQuizConfig(slug) {
  const [quiz, setQuiz] = useState(null);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function loadQuiz() {
      try {
        const quizData = await getQuizBySlug(slug);
        if (!quizData) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }

        const screensData = await getScreens(quizData.id);
        setQuiz(quizData);
        setScreens(screensData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [slug]);

  return { quiz, screens, loading, error };
}
