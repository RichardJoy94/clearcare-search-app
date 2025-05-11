'use client';
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import Tabs from '../components/Tabs';
import typesenseClient from '../lib/typesenseClient';


interface Result {
  id: string;
  title: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  _highlight?: {
    title?: string[];
    description?: string[];
  };
}

export default function HomePage() {
  const [results, setResults] = useState<Result[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('none');
  const [lastQuery, setLastQuery] = useState<string>('');

  const categories = ['All', 'Vaccinations', 'Imaging', 'Lab Tests', 'Primary Care'];

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const searchResults = await response.json();
      console.log('Raw search results:', searchResults);  // Diagnostic log

      const hits = searchResults.hits?.map((hit: any) => ({
        ...hit.document,
        _highlight: hit.highlight,
      })) || [];

      setResults(hits);
      setLastQuery(query);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Healthcare Price Transparency</h1>
      <SearchBar onSearch={handleSearch} />

      {/* Category Filter Buttons */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              margin: '0.25rem',
              padding: '0.5rem 1rem',
              border: category === activeCategory ? '2px solid black' : '1px solid #ccc',
              backgroundColor: category === activeCategory ? '#fff' : '#f9f9f9',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <span style={{ marginRight: '1rem' }}>Sort by Price:</span>
        <button onClick={() => setSortOrder('lowToHigh')} style={{ marginRight: '0.5rem' }}>
          Low to High
        </button>
        <button onClick={() => setSortOrder('highToLow')}>High to Low</button>
      </div>

      {/* Search Summary */}
      <p style={{ marginBottom: '1rem' }}>
        {`Showing ${results.filter(result => activeCategory === 'All' || result.category === activeCategory).length} result${results.filter(result => activeCategory === 'All' || result.category === activeCategory).length !== 1 ? 's' : ''}${lastQuery ? ` for '${lastQuery}'` : ''}`}
      </p>

      {/* Results List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results
          .filter(result => activeCategory === 'All' || result.category === activeCategory)
          .sort((a, b) => {
            if (sortOrder === 'lowToHigh') return a.price_min - b.price_min;
            if (sortOrder === 'highToLow') return b.price_min - a.price_min;
            return 0;
          })
          .map((result) => (
            <li key={result.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <h3
                style={{ margin: '0 0 0.5rem 0' }}
                dangerouslySetInnerHTML={{ __html: result._highlight?.title?.[0] || result.title }}
              ></h3>
              <Tabs
                tabs={[
                  {
                    label: 'Overview',
                    content: (
                      <>
                        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Category:</strong> {result.category}</p>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                          <strong>Description:</strong>{' '}
                          <span
                            dangerouslySetInnerHTML={{ __html: result._highlight?.description?.[0] || result.description }}
                          ></span>
                        </p>
                        <p style={{ margin: 0 }}><strong>Price Range:</strong> ${result.price_min} - ${result.price_max}</p>
                      </>
                    ),
                  },
                ]}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}
