import { useState, useEffect } from 'react';
import { auth, db, isFirebaseInitialized } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
} from 'firebase/firestore';

export interface SavedResult {
  id: string;
  name: string;
  price: number;
  location: string;
  category: string;
  providerUrl?: string;
}

export const useSavedResults = (resultId: string) => {
  // Only call useAuthState if Firebase is initialized
  const [user] = useAuthState(auth!);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!isFirebaseInitialized() || !user || !db) {
        setIsSaved(false);
        setIsLoading(false);
        return;
      }

      try {
        const savedRef = doc(db, 'users', user.uid, 'savedResults', resultId);
        const savedDoc = await getDoc(savedRef);
        setIsSaved(savedDoc.exists());
        setError(null);
      } catch (error) {
        console.error('Error checking saved status:', error);
        setError('Failed to check saved status');
      }
      setIsLoading(false);
    };

    checkIfSaved();
  }, [user, resultId]);

  const toggleSaved = async (result: SavedResult) => {
    if (!isFirebaseInitialized() || !user || !db) {
      setError('Firebase is not initialized or user is not logged in');
      return;
    }

    try {
      const savedRef = doc(db, 'users', user.uid, 'savedResults', resultId);

      if (isSaved) {
        await deleteDoc(savedRef);
        setIsSaved(false);
      } else {
        await setDoc(savedRef, {
          ...result,
          savedAt: new Date().toISOString(),
        });
        setIsSaved(true);
      }
      setError(null);
    } catch (error) {
      console.error('Error toggling saved status:', error);
      setError('Failed to update saved status');
    }
  };

  return { isSaved, isLoading, error, toggleSaved };
}; 