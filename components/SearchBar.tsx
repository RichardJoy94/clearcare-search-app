import { ChangeEvent } from 'react';

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: (query: string) => void;
}

export default function SearchBar({ query, setQuery, onSearch }: SearchBarProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for medical services…"
        style={{ padding: '0.5rem', width: '100%' }}
      />
    </div>
  );
}
