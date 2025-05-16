'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './PricingInsight.module.css';
import { motion } from 'framer-motion';
import { PriceSubmissionModal } from '@/components/PriceSubmissionModal';

interface PricingInsightProps {
  serviceId: string;
  averageCost: number;
  nationalRange: {
    min: number;
    max: number;
  };
  trend: 'up' | 'down' | 'stable';
  serviceName: string;
}

// Temporary simulation of Pro status
const isProUser = false; // Set to false to simulate locked state

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

const BasicInsights = ({ averageCost, nationalRange, trend, onSharePrice }: Omit<PricingInsightProps, 'serviceId' | 'serviceName'> & { onSharePrice: () => void }) => (
  <div className={styles.content}>
    <div className={styles.insightItem}>
      <span className={styles.label}>New York Average:</span>
      <span className={styles.value}>${averageCost.toLocaleString()}</span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>National Average:</span>
      <span className={styles.value}>
        ${Math.floor((nationalRange.min + nationalRange.max) / 2).toLocaleString()}
      </span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>12-Month Trend:</span>
      <span className={styles.value}>
        {getTrendIcon(trend)} {getTrendText(trend)}
      </span>
    </div>
    <button onClick={onSharePrice} className={styles.shareButton}>
      Paid a different price? Share anonymously
    </button>
  </div>
);

const PremiumInsights = ({ averageCost, nationalRange, trend, onSharePrice }: Omit<PricingInsightProps, 'serviceId' | 'serviceName'> & { onSharePrice: () => void }) => (
  <div className={styles.content}>
    <div className={styles.insightItem}>
      <span className={styles.label}>New York Average:</span>
      <span className={styles.value}>${averageCost.toLocaleString()}</span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>National Range:</span>
      <span className={styles.value}>
        ${nationalRange.min.toLocaleString()} - ${nationalRange.max.toLocaleString()}
      </span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>12-Month Trend:</span>
      <span className={styles.value}>
        {getTrendIcon(trend)} {getTrendText(trend)}
      </span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>Insurance Coverage:</span>
      <span className={styles.premiumLocked}>
        <span className={styles.lockIcon}>🔒</span> Premium Feature
      </span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>Historical Pricing:</span>
      <span className={styles.premiumLocked}>
        <span className={styles.lockIcon}>🔒</span> Premium Feature
      </span>
    </div>
    <button onClick={onSharePrice} className={styles.shareButton}>
      Paid a different price? Share anonymously
    </button>
  </div>
);

export default function PricingInsight({ serviceId, serviceName, averageCost, nationalRange, trend }: PricingInsightProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug log
  useEffect(() => {
    if (isModalOpen) {
      console.log('Opening modal with serviceName:', serviceName);
    }
  }, [isModalOpen, serviceName]);

  // Show basic insights for non-logged-in users
  if (!user) {
    return (
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className={styles.title}>Pricing Insight</h3>
        <BasicInsights 
          averageCost={averageCost} 
          nationalRange={nationalRange} 
          trend={trend} 
          onSharePrice={() => {
            console.log('Opening modal for service:', serviceName);
            setIsModalOpen(true);
          }}
        />
        <div className={styles.upsellBanner}>
          <p>Create a free account to unlock more insights and save your searches.</p>
          <div className={styles.actionButtons}>
            <button 
              onClick={() => router.push('/signup')}
              className={styles.signupButton}
            >
              Create Free Account
            </button>
          </div>
        </div>
        <PriceSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          serviceName={serviceName}
        />
      </motion.div>
    );
  }

  // Show basic insights + premium teaser for free users
  if (!isProUser) {
    return (
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className={styles.title}>Pricing Insight</h3>
        <PremiumInsights 
          averageCost={averageCost} 
          nationalRange={nationalRange} 
          trend={trend}
          onSharePrice={() => setIsModalOpen(true)}
        />
        <div className={styles.upsellBanner}>
          <p>Upgrade to Pro to unlock all premium insights.</p>
          <button 
            onClick={() => router.push('/pricing')}
            className={styles.upgradeButton}
          >
            Upgrade to Pro
          </button>
        </div>
        <PriceSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          serviceName={serviceName}
        />
      </motion.div>
    );
  }

  // Show all insights for premium users
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className={styles.title}>Pricing Insight</h3>
      <PremiumInsights 
        averageCost={averageCost} 
        nationalRange={nationalRange} 
        trend={trend}
        onSharePrice={() => setIsModalOpen(true)}
      />
      <PriceSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceName={serviceName}
      />
    </motion.div>
  );
} 