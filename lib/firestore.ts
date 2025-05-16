import { db, isFirebaseInitialized } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, deleteDoc, doc, Firestore } from 'firebase/firestore';
import { auth } from './firebase';
import { Auth } from 'firebase/auth';

export interface SavedSearch {
  id?: string;
  term: string;
  category: string;
  filters: string[];
  timestamp?: Timestamp;
  savedAt: string;
  results: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    price_min: number;
    price_max: number;
    location?: string;
    distance?: number;
  }>;
}

export async function saveSearch(userId: string, searchData: Omit<SavedSearch, 'id' | 'timestamp'>) {
  // Check if auth is available
  if (!auth) {
    console.error('Auth instance is not available');
    throw new Error('Authentication is not initialized');
  }

  // Check if user is actually authenticated
  if (!auth.currentUser) {
    console.error('No authenticated user found when attempting to save search');
    throw new Error('User must be authenticated to save search');
  }

  // Verify the userId matches the current user
  if (auth.currentUser.uid !== userId) {
    console.error('User ID mismatch when attempting to save search');
    throw new Error('User ID mismatch');
  }

  if (!isFirebaseInitialized()) {
    console.error('Firebase is not initialized when attempting to save search');
    throw new Error('Firebase is not initialized');
  }

  if (!db) {
    throw new Error('Firestore instance is not available');
  }

  if (!userId) {
    throw new Error('User ID is required to save search');
  }

  if (!searchData.term) {
    throw new Error('Search term is required');
  }

  // Validate results array
  if (!Array.isArray(searchData.results)) {
    throw new Error('Results must be an array');
  }

  // Clean and validate each result object
  const cleanedResults = searchData.results.map((result, index) => {
    if (!result.id) throw new Error(`Result at index ${index} is missing id`);
    if (!result.title) throw new Error(`Result at index ${index} is missing title`);
    if (!result.category) throw new Error(`Result at index ${index} is missing category`);
    if (typeof result.price_min !== 'number') throw new Error(`Result at index ${index} has invalid price_min`);
    if (typeof result.price_max !== 'number') throw new Error(`Result at index ${index} has invalid price_max`);

    // Return only the fields we want to store, omitting any undefined values
    return {
      id: result.id,
      title: result.title,
      category: result.category,
      description: result.description || '',
      price_min: result.price_min,
      price_max: result.price_max,
      ...(result.location ? { location: result.location } : {}),
      ...(typeof result.distance === 'number' ? { distance: result.distance } : {})
    };
  });

  try {
    console.log('Creating reference to user searches collection...');
    // Create the full path to ensure proper nesting
    const userDoc = doc(db as Firestore, 'users', userId);
    const userSearchesRef = collection(userDoc, 'savedSearches');
    
    // Clean the data before saving
    const dataToSave = {
      term: searchData.term,
      category: searchData.category || 'All',
      filters: Array.isArray(searchData.filters) ? searchData.filters.filter(Boolean) : [],
      results: cleanedResults,
      savedAt: new Date().toISOString(),
      userId: userId,
      createdBy: auth.currentUser.uid // Safe to use since we checked above
    };

    // Log the cleaned data and validation check
    console.log('Data to be saved:', JSON.stringify(dataToSave, null, 2));
    console.log('Validation check:', {
      hasRequiredFields: ['term', 'category', 'results', 'savedAt', 'userId', 'createdBy'].every(field => field in dataToSave),
      userIdMatches: dataToSave.userId === auth.currentUser.uid,
      createdByMatches: dataToSave.createdBy === auth.currentUser.uid
    });
    
    const docRef = await addDoc(userSearchesRef, dataToSave);
    console.log('Search saved successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Detailed error in saveSearch:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      userId,
      searchDataTerm: searchData.term,
      searchDataCategory: searchData.category,
      resultsCount: searchData.results.length,
      stack: error instanceof Error ? error.stack : undefined,
      currentUser: auth.currentUser?.uid,
      isAuthenticated: !!auth.currentUser
    });
    throw error;
  }
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  if (!isFirebaseInitialized() || !db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userSearchesRef = collection(db as Firestore, 'users', userId, 'savedSearches');
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
  if (!isFirebaseInitialized() || !db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const searchRef = doc(db as Firestore, 'users', userId, 'savedSearches', searchId);
    await deleteDoc(searchRef);
  } catch (error) {
    console.error('Error deleting saved search:', error);
    throw error;
  }
} 