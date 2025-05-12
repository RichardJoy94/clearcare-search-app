'use client';
import { useSearch } from './hooks/useSearch';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import Skeleton from './components/Skeleton';
import styles from './page.module.css';

const CATEGORIES = ['All', 'Vaccinations', 'Imaging', 'Lab Tests', 'Primary Care'];
const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'lowToHigh' },
  { label: 'Price: High to Low', value: 'highToLow' },
];

export default function HomePage() {
  const {
    query,
    results,
    activeCategory,
    sortOrder,
    lastQuery,
    totalResultsCount,
    visibleCount,
    loading,
    error,
    handleSearch,
    clearSearch,
    setCategory,
    setSortOrder,
    loadMore,
  } = useSearch();

  const filteredResults = results.filter(
    result => activeCategory === 'All' || result.category === activeCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortOrder === 'lowToHigh') return a.price_min - b.price_min;
    if (sortOrder === 'highToLow') return b.price_min - a.price_min;
    return 0;
  });

  const visibleResults = sortedResults.slice(0, visibleCount);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Healthcare Price Transparency</h1>
        <SearchBar
          value={query}
          onChange={handleSearch}
          onClear={clearSearch}
          placeholder="Search for healthcare services..."
          aria-label="Search healthcare services"
        />
        {lastQuery && (
          <button onClick={clearSearch} className={styles.clearButton}>
            Clear Search
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.categories}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setCategory(category)}
              className={`${styles.categoryButton} ${
                category === activeCategory ? styles.active : ''
              }`}
              aria-pressed={category === activeCategory}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.sorting}>
          <span className={styles.sortLabel}>Sort by:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortOrder(option.value)}
              className={`${styles.sortButton} ${
                sortOrder === option.value ? styles.active : ''
              }`}
              aria-pressed={sortOrder === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.status}>
        {loading && <p>Searching...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && lastQuery && (
          <p>
            {`${filteredResults.length} result${
              filteredResults.length !== 1 ? 's' : ''
            } found for "${lastQuery}"`}
          </p>
        )}
      </div>

      {loading ? (
        <Skeleton count={3} />
      ) : (
        <ul className={styles.results}>
          {visibleResults.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </ul>
      )}

      {!loading && visibleResults.length < filteredResults.length && (
        <button onClick={loadMore} className={styles.loadMore}>
          Load More Results
        </button>
      )}
    </main>
  );
}
