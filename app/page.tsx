'use client';
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import typesenseClient from '../lib/typesenseClient';

interface Result {
  id: string;
  title: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
}

export default function HomePage() {
  const [results, setResults] = useState<Result[]>([]);

  const handleSearch = async (query: string) => {
    try {
      const searchResults = await typesenseClient
        .collections('services')
        .documents()
        .search({
          q: query,
          query_by: 'title,category,keywords,description',
        });

      setResults(searchResults.hits.map((hit: any) => hit.document));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

    return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Healthcare Price Transparency</h1>
      <SearchBar onSearch={handleSearch} />
      
      {results.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No results found.</p>
      ) : (
        <div>
          <p style={{ marginBottom: '1rem' }}>
            Showing {results.length} result{results.length > 1 ? 's' : ''}:
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.map((result) => (
              <li key={result.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{result.title}</h3>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Category:</strong> {result.category}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Description:</strong> {result.description}</p>
                <p style={{ margin: 0 }}><strong>Price Range:</strong> ${result.price_min} - ${result.price_max}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
