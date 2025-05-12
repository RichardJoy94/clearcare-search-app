import { useState } from 'react';
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
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`tab-panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          className={styles.tabPanel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
} 