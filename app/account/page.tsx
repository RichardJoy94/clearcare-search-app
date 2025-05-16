'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './account.module.css';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { SavedSearch, getSavedSearches, deleteSavedSearch } from '../../lib/firestore';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loadingSearches, setLoadingSearches] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const loadSavedSearches = async () => {
      if (!user) {
        console.log('No user available to load searches');
        return;
      }

      console.log('Loading saved searches for user:', user.uid);
      try {
        const searches = await getSavedSearches(user.uid);
        console.log('Loaded saved searches:', searches);
        setSavedSearches(searches);
        setError(null);
      } catch (error) {
        console.error('Error loading saved searches:', error);
        setError('Failed to load saved searches. Please try again later.');
      } finally {
        setLoadingSearches(false);
      }
    };

    if (user) {
      loadSavedSearches();
    } else {
      setLoadingSearches(false);
    }
  }, [user]);

  const handleDeleteSearch = async (searchId: string) => {
    if (!user) {
      console.log('No user available to delete search');
      return;
    }

    console.log('Deleting search:', searchId);
    try {
      await deleteSavedSearch(user.uid, searchId);
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      setError(null);
      console.log('Search deleted successfully');
    } catch (error) {
      console.error('Error deleting search:', error);
      setError('Failed to delete search. Please try again later.');
    }
  };

  const handleViewSearch = (search: SavedSearch) => {
    console.log('Viewing search:', search);
    const queryParams = new URLSearchParams({
      term: search.term,
      category: search.category,
      ...search.filters.reduce((acc, filter) => ({ ...acc, filter }), {})
    });
    router.push(`/?${queryParams.toString()}`);
  };

  if (loading || loadingSearches) {
    console.log('Loading state:', { authLoading: loading, searchesLoading: loadingSearches });
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading...
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, rendering null');
    return null;
  }

  console.log('Rendering account page with searches:', savedSearches);
  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>My Account</h1>
        <div className={styles.welcomeMessage}>
          Welcome, {user.email}!
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <section className={styles.section}>
          <h2>Saved Searches</h2>
          {savedSearches.length > 0 ? (
            <div className={styles.savedSearches}>
              {savedSearches.map((search) => (
                <motion.div 
                  key={search.id}
                  className={styles.searchCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={styles.searchInfo}>
                    <h3>{search.term}</h3>
                    <p className={styles.searchMeta}>
                      {search.category} • {search.filters.join(', ')}
                    </p>
                    <p className={styles.timestamp}>
                      Saved on {search.timestamp ? search.timestamp.toDate().toLocaleDateString() : search.savedAt}
                    </p>
                  </div>
                  <div className={styles.searchActions}>
                    <motion.button
                      onClick={() => handleViewSearch(search)}
                      className={styles.viewButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Results
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteSearch(search.id!)}
                      className={styles.deleteButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No saved searches yet.</p>
          )}
        </section>
      </motion.div>
    </div>
  );
} 