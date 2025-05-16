'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './account.module.css';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { SavedSearch, getSavedSearches, deleteSavedSearch } from '@/lib/firestore';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loadingSearches, setLoadingSearches] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const loadSavedSearches = async () => {
      if (!user) return;

      try {
        const searches = await getSavedSearches(user.uid);
        setSavedSearches(searches);
      } catch (error) {
        console.error('Error loading saved searches:', error);
      } finally {
        setLoadingSearches(false);
      }
    };

    if (user) {
      loadSavedSearches();
    }
  }, [user]);

  const handleDeleteSearch = async (searchId: string) => {
    if (!user) return;

    try {
      await deleteSavedSearch(user.uid, searchId);
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleViewSearch = (search: SavedSearch) => {
    const queryParams = new URLSearchParams({
      term: search.term,
      category: search.category,
      ...search.filters.reduce((acc, filter) => ({ ...acc, filter }), {})
    });
    router.push(`/?${queryParams.toString()}`);
  };

  if (loading || loadingSearches) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

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