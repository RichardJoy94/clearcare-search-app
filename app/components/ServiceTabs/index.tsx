'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './ServiceTabs.module.css';

interface ServiceTabsProps {
  serviceId: string;
  overview: React.ReactNode;
  locations: React.ReactNode;
  comparePlans?: React.ReactNode;
  careCart?: React.ReactNode;
}

export default function ServiceTabs({ 
  serviceId, 
  overview, 
  locations, 
  comparePlans, 
  careCart 
}: ServiceTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  // Temporary simulation of Pro status - replace with actual user tier check
  const isPremiumUser = false;

  const handlePremiumFeatureClick = () => {
    if (!user) {
      router.push('/signup');
      return;
    }
    router.push('/pricing');
  };

  const tabs = [
    {
      label: 'Overview',
      content: overview,
      isAvailable: true
    },
    {
      label: 'Locations',
      content: locations,
      isAvailable: true
    },
    {
      label: 'Compare Plans',
      content: comparePlans || (
        <div className={styles.premiumFeature}>
          <div className={styles.lockIcon}>🔒</div>
          <h3>Premium Feature</h3>
          <p>Compare insurance plans and estimated out-of-pocket costs.</p>
          <button 
            onClick={handlePremiumFeatureClick}
            className={styles.upgradeButton}
          >
            {user ? 'Upgrade to Premium' : 'Create Free Account'}
          </button>
        </div>
      ),
      isAvailable: isPremiumUser
    },
    {
      label: 'Care Cart',
      content: careCart || (
        <div className={styles.premiumFeature}>
          <div className={styles.lockIcon}>🔒</div>
          <h3>Premium Feature</h3>
          <p>Add services to your care cart to plan your healthcare journey.</p>
          <button 
            onClick={handlePremiumFeatureClick}
            className={styles.upgradeButton}
          >
            {user ? 'Upgrade to Premium' : 'Create Free Account'}
          </button>
        </div>
      ),
      isAvailable: isPremiumUser
    }
  ];

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tab-panel-${index}`}
            id={`tab-${index}`}
            className={`${styles.tabButton} ${activeTab === index ? styles.active : ''} ${
              !tab.isAvailable ? styles.premium : ''
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
            {!tab.isAvailable && <span className={styles.lockIndicator}>🔒</span>}
            {activeTab === index && (
              <motion.div
                className={styles.activeIndicator}
                layoutId="activeIndicator"
              />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
          id={`tab-panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={styles.tabPanel}
        >
          {tabs[activeTab].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 