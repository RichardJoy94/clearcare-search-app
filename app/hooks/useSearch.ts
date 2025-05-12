import { useState, useCallback, useEffect } from 'react';
import { SearchResult, SearchState } from '@/app/types';
import debounce from 'lodash/debounce';

const INITIAL_STATE: SearchState = {
  query: '',
  results: [],
  activeCategory: 'All',
  sortOrder: 'none',
  lastQuery: '',
  totalResultsCount: 0,
  visibleCount: 5,
  loading: false,
  error: null,
};

export function useSearch() {
  const [state, setState] = useState<SearchState>(INITIAL_STATE);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setState(prev => ({ ...prev, results: [], loading: false, error: null }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const searchResults = await response.json();
        const hits = searchResults.hits?.map((hit: any) => hit.document) || [];

        setState(prev => ({
          ...prev,
          results: hits,
          totalResultsCount: hits.length,
          lastQuery: searchQuery,
          loading: false,
        }));
      } catch (error) {
        console.error('Search error:', error);
        setState(prev => ({
          ...prev,
          error: 'An error occurred. Please try again.',
          results: [],
          loading: false,
        }));
      }
    }, 300),
    []
  );

  const handleSearch = useCallback((searchQuery: string) => {
    setState(prev => ({ ...prev, query: searchQuery }));
    debouncedSearch(searchQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const setCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, activeCategory: category }));
  }, []);

  const setSortOrder = useCallback((order: 'none' | 'lowToHigh' | 'highToLow') => {
    setState(prev => ({ ...prev, sortOrder: order }));
  }, []);

  const loadMore = useCallback(() => {
    setState(prev => ({ ...prev, visibleCount: prev.visibleCount + 5 }));
  }, []);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    ...state,
    handleSearch,
    clearSearch,
    setCategory,
    setSortOrder,
    loadMore,
  };
} 