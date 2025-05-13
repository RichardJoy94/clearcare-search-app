'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, isFirebaseInitialized } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, Auth } from 'firebase/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Provide default values when auth is null
  const [user, loading] = auth ? useAuthState(auth as Auth) : [null, false];
  const isInitialized = isFirebaseInitialized();

  const signInWithGoogle = async () => {
    if (!isInitialized || !auth) {
      console.error('Firebase is not initialized');
      return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    if (!isInitialized || !auth) {
      console.error('Firebase is not initialized');
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    isInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 