import { db } from './firebaseClient';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';

export interface SavedSearch {
  id?: string;
  term: string;
  category: string;
  filters: string[];
  timestamp: Timestamp;
  results: any[]; // Store the actual search results
}

export async function saveSearch(userId: string, searchData: Omit<SavedSearch, 'id' | 'timestamp'>) {
  try {
    const userSearchesRef = collection(db, 'users', userId, 'savedSearches');
    const docRef = await addDoc(userSearchesRef, {
      ...searchData,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving search:', error);
    throw error;
  }
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  try {
    const userSearchesRef = collection(db, 'users', userId, 'savedSearches');
    const q = query(userSearchesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedSearch[];
  } catch (error) {
    console.error('Error getting saved searches:', error);
    throw error;
  }
}

export async function deleteSavedSearch(userId: string, searchId: string) {
  try {
    const searchRef = doc(db, 'users', userId, 'savedSearches', searchId);
    await deleteDoc(searchRef);
  } catch (error) {
    console.error('Error deleting saved search:', error);
    throw error;
  }
} 