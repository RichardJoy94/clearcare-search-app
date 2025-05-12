import { motion } from 'framer-motion';
import { SearchResult } from '@/app/types';
import Tabs from '../Tabs';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  result: SearchResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.card}
    >
      <h3 className={styles.title}>{result.title}</h3>
      <Tabs
        tabs={[
          {
            label: 'Overview',
            content: (
              <div className={styles.content}>
                <p className={styles.field}>
                  <strong>Category:</strong> {result.category}
                </p>
                <p className={styles.field}>
                  <strong>Description:</strong> {result.description}
                </p>
                <p className={styles.price}>
                  <strong>Price Range:</strong>{' '}
                  <span className={styles.priceValue}>
                    ${result.price_min.toLocaleString()} - ${result.price_max.toLocaleString()}
                  </span>
                </p>
              </div>
            ),
          },
          {
            label: 'Details',
            content: (
              <div className={styles.content}>
                <p className={styles.field}>
                  <strong>Service ID:</strong> {result.id}
                </p>
                <p className={styles.field}>
                  <strong>Average Cost:</strong>{' '}
                  <span className={styles.priceValue}>
                    ${((result.price_min + result.price_max) / 2).toLocaleString()}
                  </span>
                </p>
                <p className={styles.field}>
                  <strong>Insurance Info:</strong> Contact provider for specific insurance details
                </p>
              </div>
            ),
          },
          {
            label: 'Location',
            content: (
              <div className={styles.content}>
                <p className={styles.field}>
                  <strong>Availability:</strong> Multiple locations available
                </p>
                <p className={styles.field}>
                  <strong>Contact:</strong> Please call for specific location details
                </p>
                <button className={styles.actionButton}>
                  Find Nearest Location
                </button>
              </div>
            ),
          },
        ]}
      />
    </motion.li>
  );
} 