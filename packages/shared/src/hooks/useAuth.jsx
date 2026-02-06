import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthChange,
  getUserData,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout,
  resetPassword,
} from '../firebase/auth';

const AuthContext = createContext({
  user: null,
  userData: null,
  loading: true,
  error: null,
  login: async () => {},
  loginGoogle: async () => {},
  register: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const data = await getUserData(firebaseUser.uid);
          setUserData(data);
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const loginGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const register = async (email, password, displayName) => {
    setError(null);
    try {
      await registerWithEmail(email, password, displayName);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await logout();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleResetPassword = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        login,
        loginGoogle,
        register,
        signOut,
        resetPassword: handleResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guard component
export function AuthGuard({ children, fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  return children;
}
