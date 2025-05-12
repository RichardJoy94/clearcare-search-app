import { ChangeEvent, KeyboardEvent } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  'aria-label'?: string;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  'aria-label': ariaLabel,
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.input}
        aria-label={ariaLabel}
      />
      {value && (
        <button
          onClick={onClear}
          className={styles.clearButton}
          aria-label="Clear search"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
} 