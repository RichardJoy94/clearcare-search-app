'use client';
import styles from './account.module.css';
import { motion } from 'framer-motion';

export default function AccountPage() {
  // Placeholder data for saved searches
  const savedSearches = [
    { id: 1, query: 'Primary Care Physician', date: '2024-03-15' },
    { id: 2, query: 'Dental Cleaning', date: '2024-03-14' },
  ];

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>My Account</h1>
        
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
                    <h3>{search.query}</h3>
                    <p>Saved on {search.date}</p>
                  </div>
                  <button className={styles.viewButton}>
                    View Results
                  </button>
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