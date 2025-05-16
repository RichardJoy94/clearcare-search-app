'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, isFirebaseInitialized } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, Auth, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isInitialized: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  isInitialized: false,
  error: null
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading, authStateError] = auth ? useAuthState(auth as Auth) : [null, false, null];
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Handle auth state error
  useEffect(() => {
    if (authStateError) {
      setAuthError(authStateError);
    }
  }, [authStateError]);

  useEffect(() => {
    // Check Firebase initialization
    const checkInitialization = async () => {
      try {
        if (!isFirebaseInitialized()) {
          console.error('Firebase is not initialized');
          setAuthError(new Error('Firebase initialization failed'));
          return;
        }
        setIsInitialized(true);
      } catch (err) {
        console.error('Error checking Firebase initialization:', err);
        setAuthError(err instanceof Error ? err : new Error('Unknown initialization error'));
      }
    };

    checkInitialization();
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed: User is signed in');
      } else {
        console.log('Auth state changed: User is signed out');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isInitialized || !auth) {
      console.error('Firebase is not initialized');
      setAuthError(new Error('Firebase is not initialized'));
      return;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthError(null);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthError(error instanceof Error ? error : new Error('Failed to sign in with Google'));
    }
  };

  const logout = async () => {
    if (!isInitialized || !auth) {
      console.error('Firebase is not initialized');
      setAuthError(new Error('Firebase is not initialized'));
      return;
    }

    try {
      await signOut(auth);
      setAuthError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error instanceof Error ? error : new Error('Failed to sign out'));
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    isInitialized,
    error: authError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 