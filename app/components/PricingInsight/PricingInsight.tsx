'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './PricingInsight.module.css';
import { motion } from 'framer-motion';

interface PricingInsightProps {
  serviceId: string;
  averageCost: number;
  nationalRange: {
    min: number;
    max: number;
  };
  trend: 'up' | 'down' | 'stable';
}

// Temporary simulation of Pro status
const isProUser = false; // Set to false to simulate locked state

const StaticPreviewData = () => (
  <div className={styles.previewContent}>
    <div className={styles.insightItem}>
      <span className={styles.label}>Average in NYC:</span>
      <span className={styles.value}>$150</span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>National Range:</span>
      <span className={styles.value}>$80 - $300</span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>Last 12 Months Trend:</span>
      <span className={styles.value}>→ Stable</span>
    </div>
  </div>
);

export default function PricingInsight({ serviceId, averageCost, nationalRange, trend }: PricingInsightProps) {
  const { user } = useAuth();
  const router = useRouter();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'Increasing';
      case 'down':
        return 'Decreasing';
      default:
        return 'Stable';
    }
  };

  if (!user) {
    return (
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className={styles.title}>Pricing Insight</h3>
        <div className={styles.previewContainer}>
          <StaticPreviewData />
          <div className={styles.lockedOverlay}>
            <p>Sign up or log in to unlock Pricing Insight.</p>
            <div className={styles.actionButtons}>
              <button 
                onClick={() => router.push('/login')}
                className={styles.loginButton}
              >
                Log In
              </button>
              <button 
                onClick={() => router.push('/signup')}
                className={styles.signupButton}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isProUser) {
    return (
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className={styles.title}>Pricing Insight</h3>
        <div className={styles.previewContainer}>
          <StaticPreviewData />
          <div className={styles.lockedOverlay}>
            <p>Upgrade to Pro to unlock Pricing Insight.</p>
            <button 
              onClick={() => router.push('/pricing')}
              className={styles.upgradeButton}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className={styles.title}>Pricing Insight</h3>
      <div className={styles.content}>
        <div className={styles.insightItem}>
          <span className={styles.label}>Average in NYC:</span>
          <span className={styles.value}>${averageCost.toLocaleString()}</span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.label}>National Range:</span>
          <span className={styles.value}>
            ${nationalRange.min.toLocaleString()} - ${nationalRange.max.toLocaleString()}
          </span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.label}>Last 12 Months Trend:</span>
          <span className={styles.value}>
            {getTrendIcon(trend)} {getTrendText(trend)}
          </span>
        </div>
      </div>
    </motion.div>
  );
} 