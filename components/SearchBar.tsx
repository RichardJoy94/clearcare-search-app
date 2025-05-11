import { useState, ChangeEvent, useMemo } from 'react';
import debounce from 'lodash.debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
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
