'use client';
import { useState } from 'react';
import { SearchResult } from './types';
import Tabs from './components/Tabs';
import styles from './page.module.css';

export default function HomePage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('none');
  const [lastQuery, setLastQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const categories = ['All', 'Vaccinations', 'Imaging', 'Lab Tests', 'Primary Care'];

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const searchResults = await response.json();
      const hits = searchResults.hits?.map((hit: any) => ({
        ...hit.document,
        _highlight: hit.highlight,
      })) || [];

      setResults(hits);
      setLastQuery(query);
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

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Healthcare Price Transparency</h1>
      
      <div className={styles.searchContainer}>
        <input
          type="search"
          placeholder="Search healthcare services..."
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

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
            {`Showing ${sortedResults.length} result${
              sortedResults.length !== 1 ? 's' : ''
            }${lastQuery ? ` for "${lastQuery}"` : ''}`}
          </div>

          <ul className={styles.results}>
            {sortedResults.map((result) => (
              <li key={result.id} className={styles.resultCard}>
                <h3
                  className={styles.resultTitle}
                  dangerouslySetInnerHTML={{
                    __html: result._highlight?.title?.[0] || result.title,
                  }}
                />
                <Tabs
                  tabs={[
                    {
                      label: 'Overview',
                      content: (
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
                          <p className={styles.price}>
                            <strong>Price Range:</strong> ${result.price_min.toLocaleString()} - $
                            {result.price_max.toLocaleString()}
                          </p>
                        </div>
                      ),
                    },
                    {
                      label: 'Location',
                      content: (
                        <div className={styles.resultContent}>
                          <p><strong>Primary Location:</strong> {result.location || 'Main Medical Center'}</p>
                          <p><strong>Distance:</strong> {result.distance || '< 5'} miles</p>
                          <p><strong>Available Locations:</strong></p>
                          <ul className={styles.locationList}>
                            <li>Main Medical Center - 1234 Healthcare Ave</li>
                            <li>Downtown Clinic - 567 Wellness St</li>
                            <li>West Side Medical - 890 Healing Blvd</li>
                          </ul>
                        </div>
                      ),
                    },
                    {
                      label: 'Details',
                      content: (
                        <div className={styles.resultContent}>
                          <p><strong>Service ID:</strong> {result.id}</p>
                          <p>
                            <strong>Average Cost:</strong> $
                            {((result.price_min + result.price_max) / 2).toLocaleString()}
                          </p>
                          <p><strong>Insurance Info:</strong> Contact provider for details</p>
                          <p><strong>Preparation:</strong> No special preparation required</p>
                          <p><strong>Duration:</strong> Approximately 30 minutes</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
