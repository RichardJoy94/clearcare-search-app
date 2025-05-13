import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
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
  const [user] = useAuthState(auth);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user) {
        setIsSaved(false);
        setIsLoading(false);
        return;
      }

      try {
        const savedRef = doc(db, 'users', user.uid, 'savedResults', resultId);
        const savedDoc = await getDoc(savedRef);
        setIsSaved(savedDoc.exists());
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
      setIsLoading(false);
    };

    checkIfSaved();
  }, [user, resultId]);

  const toggleSaved = async (result: SavedResult) => {
    if (!user) {
      // Handle not logged in state - you might want to trigger a login prompt
      console.log('User must be logged in to save results');
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
    } catch (error) {
      console.error('Error toggling saved status:', error);
    }
  };

  return { isSaved, isLoading, toggleSaved };
}; 