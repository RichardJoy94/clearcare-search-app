'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './PricingInsight.module.css';
import { motion } from 'framer-motion';
import { PriceSubmissionModal } from '@/components/PriceSubmissionModal';
import { Fragment } from 'react';

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

// Tooltip component
const InfoTooltip = ({ text }: { text: string }) => (
  <span className="relative group inline-block align-middle ml-1">
    <span
      tabIndex={0}
      className="cursor-pointer text-blue-400 focus:outline-none"
      aria-label="Info"
    >
      ℹ️
    </span>
    <span className="absolute left-1/2 z-20 w-48 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
      {text}
    </span>
  </span>
);

// Lock icon with tooltip
const LockTooltip = ({ text }: { text: string }) => (
  <span className="relative group inline-block align-middle ml-1">
    <span
      tabIndex={0}
      className="cursor-pointer text-gray-400 focus:outline-none"
      aria-label="Locked"
    >
      <svg className="inline w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2"/><path d="M12 16v-4"/><path d="M8 10V8a4 4 0 1 1 8 0v2"/></svg>
    </span>
    <span className="absolute left-1/2 z-20 w-56 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
      {text}
    </span>
  </span>
);

// Placeholder for sparkline
const MiniSparkline = () => (
  <span className="inline-block align-middle ml-2">
    {/* Placeholder: Replace with <Sparklines> if react-sparklines is installed */}
    <svg width="60" height="18"><polyline points="2,16 10,10 18,12 26,6 34,8 42,4 50,10 58,2" fill="none" stroke="#3b82f6" strokeWidth="2"/></svg>
  </span>
);

const BasicInsights = ({ averageCost, nationalRange, trend, onSharePrice }: Omit<PricingInsightProps, 'serviceId' | 'serviceName'> & { onSharePrice: () => void }) => (
  <div className={styles.content}>
    <div className={styles.insightItem}>
      <span className={styles.label}>
        New York Average:
        <InfoTooltip text="The average price for this service in New York." />
      </span>
      <span className={styles.value}>${averageCost.toLocaleString()}</span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>
        National Average:
        <InfoTooltip text="The average price for this service across the US." />
      </span>
      <span className={styles.value}>
        ${Math.floor((nationalRange.min + nationalRange.max) / 2).toLocaleString()}
      </span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>
        12-Month Trend:
        <InfoTooltip text="How prices have changed over the past year." />
      </span>
      <span className={styles.value}>
        {getTrendIcon(trend)} {getTrendText(trend)} <MiniSparkline />
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
      <span className={styles.label}>
        New York Average:
        <InfoTooltip text="The average price for this service in New York." />
      </span>
      <span className={styles.value}>${averageCost.toLocaleString()}</span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>
        National Range:
        <InfoTooltip text="The price range for this service across the US." />
      </span>
      <span className={styles.value}>
        ${nationalRange.min.toLocaleString()} - ${nationalRange.max.toLocaleString()}
      </span>
    </div>
    <div className={styles.insightItem}>
      <span className={styles.label}>
        12-Month Trend:
        <InfoTooltip text="How prices have changed over the past year." />
      </span>
      <span className={styles.value}>
        {getTrendIcon(trend)} {getTrendText(trend)} <MiniSparkline />
      </span>
    </div>
    {/* Locked Premium Rows */}
    <div className="flex items-center gap-2 bg-gray-100 text-gray-400 rounded px-3 py-2 mt-2 opacity-60 blur-[1px] pointer-events-none select-none">
      <span className="font-medium">Insurance Coverage:</span>
      <span>Premium Feature</span>
      <span className="pointer-events-auto blur-0 ml-2"><LockTooltip text="Upgrade to unlock historical insights" /></span>
    </div>
    <div className="flex items-center gap-2 bg-gray-100 text-gray-400 rounded px-3 py-2 mt-2 opacity-60 blur-[1px] pointer-events-none select-none">
      <span className="font-medium">Historical Pricing:</span>
      <span>Premium Feature</span>
      <span className="pointer-events-auto blur-0 ml-2"><LockTooltip text="Upgrade to unlock historical insights" /></span>
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