'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SearchLimitContextType {
  searchCount: number;
  incrementSearchCount: () => void;
  resetSearchCount: () => void;
  isLimitReached: boolean;
  dismissGate: () => void;
  isDismissed: boolean;
}

const SEARCH_LIMIT = 3;
const STORAGE_KEY = 'clearcare_search_count';
const DISMISS_KEY = 'clearcare_gate_dismissed';

const SearchLimitContext = createContext<SearchLimitContextType | undefined>(undefined);

export function SearchLimitProvider({ children }: { children: React.ReactNode }) {
  const [searchCount, setSearchCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Load initial state from localStorage
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const storedDismissed = localStorage.getItem(DISMISS_KEY);
    
    if (storedCount) {
      setSearchCount(parseInt(storedCount));
    }
    if (storedDismissed) {
      setIsDismissed(storedDismissed === 'true');
    }
  }, []);

  const incrementSearchCount = () => {
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());
  };

  const resetSearchCount = () => {
    setSearchCount(0);
    localStorage.setItem(STORAGE_KEY, '0');
  };

  const dismissGate = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  const isLimitReached = searchCount >= SEARCH_LIMIT;

  const value = {
    searchCount,
    incrementSearchCount,
    resetSearchCount,
    isLimitReached,
    dismissGate,
    isDismissed,
  };

  return (
    <SearchLimitContext.Provider value={value}>
      {children}
    </SearchLimitContext.Provider>
  );
}

export function useSearchLimit() {
  const context = useContext(SearchLimitContext);
  if (context === undefined) {
    throw new Error('useSearchLimit must be used within a SearchLimitProvider');
  }
  return context;
} 