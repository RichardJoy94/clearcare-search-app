'use client';
import { useState, useEffect, useCallback } from 'react';
import { SearchResult, SearchSuggestion } from './types';
import Tabs from './components/Tabs';
import styles from './page.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { saveSearch } from '@/lib/firestore';
import PricingInsight from './components/PricingInsight/PricingInsight';
import { useSearchLimit } from '@/contexts/SearchLimitContext';
import { SearchGate } from '@/components/SearchGate';
import ServiceTabs from './components/ServiceTabs';
import SearchSuggestions from '@/components/SearchSuggestions';
import debounce from 'lodash.debounce';

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const SaveIcon = ({ isSaved }: { isSaved: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={isSaved ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="20"
    height="20"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export default function HomePage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('none');
  const [lastQuery, setLastQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userZipCode, setUserZipCode] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // Default 10 miles
  const [visibleResults, setVisibleResults] = useState<number>(3);
  const [shareTooltip, setShareTooltip] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const router = useRouter();
  const { incrementSearchCount, isLimitReached, isDismissed } = useSearchLimit();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const categories = ['All', 'Vaccinations', 'Imaging', 'Lab Tests', 'Primary Care'];
  const distanceOptions = [5, 10, 25, 50, 100];

  // Handle URL parameters for saved searches
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('term');
    const category = params.get('category');
    
    if (searchTerm) {
      handleSearch(searchTerm);
      setLastQuery(searchTerm);
    }
    if (category) {
      setActiveCategory(category);
    }
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchInput(suggestion.title);
    setShowSuggestions(false);
    handleSearch(suggestion.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleSearch(searchInput);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (query: string) => {
    // If limit is reached and gate not dismissed, don't proceed for non-logged-in users
    if (!user && isLimitReached && !isDismissed) {
      console.log('Search limit reached:', { searchCount: isLimitReached, isDismissed });
      return;
    }

    setLoading(true);
    try {
      // Increment search count for non-logged-in users BEFORE the search
      if (!user) {
        incrementSearchCount();
        console.log('Incremented search count for non-logged-in user');
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          zipCode: userZipCode,
          maxDistance 
        }),
      });

      const searchResults = await response.json();
      const hits = searchResults.hits?.map((hit: any) => ({
        ...hit.document,
        _highlight: hit.highlight,
      })) || [];

      setResults(hits);
      setLastQuery(query);
      
      // Track search analytics
      analytics.trackSearch(query, hits.length);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(
    result => activeCategory === 'All' || result.category === activeCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortOrder === 'lowToHigh') return a.price_min - b.price_min;
    if (sortOrder === 'highToLow') return b.price_min - a.price_min;
    return 0;
  });

  const displayedResults = sortedResults.slice(0, visibleResults);
  const hasMoreResults = sortedResults.length > visibleResults;

  const handleShowMore = () => {
    setVisibleResults(prev => prev + 3);
  };

  // Function to handle saving/unsaving results
  const toggleSaveResult = async (resultId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const savedRef = doc(db, 'users', user.uid, 'savedSearches', resultId);
      
      if (savedResults.has(resultId)) {
        await deleteDoc(savedRef);
        setSavedResults(prev => {
          const newSet = new Set(prev);
          newSet.delete(resultId);
          return newSet;
        });
      } else {
        const searchData = {
          id: resultId,
          userId: user.uid,
          savedAt: new Date().toISOString(),
          searchResult: results.find(r => r.id === resultId),
        };
        
        await setDoc(savedRef, searchData);
        setSavedResults(prev => {
          const newSet = new Set(prev);
          newSet.add(resultId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // You might want to show an error message to the user here
    }
  };

  // Function to track location link clicks
  const trackLocationClick = (locationName: string, resultId: string) => {
    // Here you would implement your analytics tracking
    console.log(`Location click: ${locationName} for result ${resultId}`);
  };

  const handleSaveSearch = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Validate required data
      if (!lastQuery) {
        alert('No search query to save');
        return;
      }

      if (!results || results.length === 0) {
        alert('No search results to save');
        return;
      }

      // Log the state of results before mapping
      console.log('Current results state:', results);

      // Validate that results have all required fields
      const validResults = results.every(result => 
        result.id && 
        result.title && 
        result.category && 
        typeof result.price_min === 'number' && 
        typeof result.price_max === 'number'
      );

      if (!validResults) {
        console.error('Invalid results data:', results);
        alert('Invalid search results data');
        return;
      }

      const searchData = {
        term: lastQuery,
        category: activeCategory,
        filters: [sortOrder].filter(Boolean), // Remove empty filters
        results: results.map(result => ({
          id: result.id,
          title: result.title,
          category: result.category,
          description: result.description || '',
          price_min: Number(result.price_min),
          price_max: Number(result.price_max),
          location: result.location,
          distance: typeof result.distance === 'number' ? result.distance : undefined
        })),
        savedAt: new Date().toISOString(),
        userId: user.uid,
        createdBy: user.uid
      };

      console.log('Attempting to save search with data:', JSON.stringify(searchData, null, 2));
      const savedId = await saveSearch(user.uid, searchData);
      console.log('Search saved successfully with ID:', savedId);
      
      // Show success message to user
      alert('Search saved successfully!');
    } catch (error) {
      // Enhanced error logging
      console.error('Failed to save search:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        searchData: lastQuery,
        category: activeCategory,
        resultsLength: results.length,
        userId: user.uid,
        results: results.map(r => ({ id: r.id, hasTitle: !!r.title, hasCategory: !!r.category }))
      });
      alert('Failed to save search. Please try again');
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Healthcare Price Transparency</h1>
      
      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <input
              type="search"
              placeholder="Search healthcare services..."
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className={styles.searchInput}
            />
            <button
              className={styles.searchButton}
              onClick={() => {
                setShowSuggestions(false);
                handleSearch(searchInput);
              }}
              aria-label="Search"
              type="button"
            >
              Search
            </button>
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              visible={showSuggestions}
            />
          </div>
          <div className={styles.locationFilters}>
            <input
              type="text"
              placeholder="Enter ZIP code"
              value={userZipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setUserZipCode(value);
                if (value.length === 5 && lastQuery) {
                  handleSearch(lastQuery);
                }
              }}
              className={styles.zipInput}
              maxLength={5}
            />
            <select
              value={maxDistance}
              onChange={(e) => {
                setMaxDistance(Number(e.target.value));
                if (lastQuery) {
                  handleSearch(lastQuery);
                }
              }}
              className={styles.distanceSelect}
            >
              {distanceOptions.map((distance) => (
                <option key={distance} value={distance}>
                  Within {distance} miles
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <SearchGate />

      <div className={styles.filters}>
        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`${styles.categoryButton} ${
                category === activeCategory ? styles.active : ''
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.sorting}>
          <span>Sort by Price:</span>
          <button
            onClick={() => setSortOrder('lowToHigh')}
            className={`${styles.sortButton} ${
              sortOrder === 'lowToHigh' ? styles.active : ''
            }`}
          >
            Low to High
          </button>
          <button
            onClick={() => setSortOrder('highToLow')}
            className={`${styles.sortButton} ${
              sortOrder === 'highToLow' ? styles.active : ''
            }`}
          >
            High to Low
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Searching...</div>
      ) : (
        <>
          <div className={styles.resultsSummary}>
            <div className={styles.resultCount}>
              {`Showing ${displayedResults.length} of ${sortedResults.length} result${
                sortedResults.length !== 1 ? 's' : ''
              }${lastQuery ? ` for "${lastQuery}"` : ''}${
                userZipCode ? ` near ${userZipCode}` : ''
              }`}
            </div>
            {results.length > 0 && user && (
              <motion.button
                className={styles.saveSearchButton}
                onClick={handleSaveSearch}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save Search
              </motion.button>
            )}
          </div>

          <ul className={styles.results}>
            {displayedResults.map((result) => (
              <li key={result.id} className={styles.resultCard}>
                <div className={styles.cardHeader}>
                  <h3
                    className={styles.resultTitle}
                    dangerouslySetInnerHTML={{
                      __html: result._highlight?.title?.[0] || result.title,
                    }}
                  />
                  <div className={styles.cardActions}>
                    <motion.button
                      className={`${styles.actionButton} ${savedResults.has(result.id) ? styles.saved : ''}`}
                      onClick={() => toggleSaveResult(result.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={savedResults.has(result.id) ? "Remove from saved" : "Save this result"}
                    >
                      <SaveIcon isSaved={savedResults.has(result.id)} />
                    </motion.button>
                    <motion.button
                      className={styles.shareButton}
                      onClick={() => {
                        const shareUrl = `${window.location.origin}?service=${encodeURIComponent(result.title)}`;
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          setShareTooltip(result.id);
                          setTimeout(() => setShareTooltip(null), 2000);
                        });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Share this service"
                    >
                      <ShareIcon />
                      Share
                      <AnimatePresence>
                        {shareTooltip === result.id && (
                          <motion.span
                            className={styles.tooltip}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            Link copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
                <ServiceTabs
                  serviceId={result.id}
                  overview={
                    <div className={styles.resultContent}>
                      <p>
                        <strong>Category:</strong> {result.category}
                      </p>
                      <p>
                        <strong>Description:</strong>{' '}
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              result._highlight?.description?.[0] ||
                              result.description,
                          }}
                        />
                      </p>
                      <div className={styles.priceRanges}>
                        <div className={styles.priceRange}>
                          <strong>Cash Price Range:</strong>
                          <span className={styles.priceValue}>
                            ${Math.floor(result.price_min * 1.2).toLocaleString()} - $
                            {Math.floor(result.price_max * 1.2).toLocaleString()}
                          </span>
                          <span className={styles.priceBadge}>No Insurance</span>
                        </div>
                        <div className={styles.priceRange}>
                          <strong>Insured Range:</strong>
                          <span className={styles.priceValue}>
                            ${Math.floor(result.price_min * 0.3).toLocaleString()} - $
                            {Math.floor(result.price_max * 0.3).toLocaleString()}
                          </span>
                          <span className={styles.priceBadge}>With Insurance</span>
                        </div>
                      </div>
                      {result.distance && (
                        <p className={styles.distance}>
                          <strong>Distance:</strong> {result.distance.toFixed(1)} miles away
                        </p>
                      )}
                      <PricingInsight
                        serviceId={result.id}
                        serviceName={result.title}
                        averageCost={Math.floor((result.price_min + result.price_max) / 2)}
                        nationalRange={{
                          min: Math.floor(result.price_min * 0.8),
                          max: Math.floor(result.price_max * 1.2)
                        }}
                        trend={result.price_min > 1000 ? 'up' : result.price_min > 500 ? 'stable' : 'down'}
                      />
                    </div>
                  }
                  locations={
                    <div className={styles.resultContent}>
                      <div className={styles.locationInfo}>
                        <p>
                          <strong>Primary Location:</strong>{' '}
                          <span>{result.location || 'Main Medical Center'}</span>
                          {result.distance && (
                            <span className={styles.distance}>
                              {result.distance.toFixed(1)} miles away
                            </span>
                          )}
                        </p>
                        <p><strong>Other Locations:</strong></p>
                        <ul className={styles.locationList}>
                          <li>
                            <span>Downtown Clinic</span>
                            <div className={styles.locationActions}>
                              <span className={styles.locationMeta}>8AM-6PM</span>
                              <a
                                href="https://example.com/downtown-clinic"
                                className={styles.locationLink}
                                onClick={() => trackLocationClick('Downtown Clinic', result.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Visit Website →
                              </a>
                            </div>
                          </li>
                          <li>
                            <span>West Side Medical</span>
                            <div className={styles.locationActions}>
                              <span className={styles.locationMeta}>7AM-8PM</span>
                              <a
                                href="https://example.com/westside-medical"
                                className={styles.locationLink}
                                onClick={() => trackLocationClick('West Side Medical', result.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Visit Website →
                              </a>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  }
                />
              </li>
            ))}
          </ul>

          {hasMoreResults && (
            <motion.button
              className={styles.showMoreButton}
              onClick={handleShowMore}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Show More Results
            </motion.button>
          )}
        </>
      )}
    </main>
  );
}
