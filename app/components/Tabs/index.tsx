import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabData } from '@/app/types';
import styles from './Tabs.module.css';

interface TabsProps {
  tabs: TabData[];
  defaultTab?: number;
}

export default function Tabs({ tabs, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

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
            className={`${styles.tabButton} ${activeTab === index ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
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