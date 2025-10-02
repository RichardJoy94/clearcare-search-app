import { motion } from 'framer-motion';
import styles from './SearchSuggestions.module.css';

interface SearchSuggestion {
  id: string;
  display_name: string;
  category: string;
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  visible: boolean;
}

export default function SearchSuggestions({ suggestions, onSelect, visible }: SearchSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <motion.div 
      className={styles.suggestionsContainer}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {suggestions.map((suggestion) => (
        <motion.div
          key={suggestion.id}
          className={styles.suggestionItem}
          onClick={() => onSelect(suggestion)}
          whileHover={{ backgroundColor: '#f7fafc' }}
        >
          <div className={styles.suggestionTitle}>{suggestion.display_name}</div>
          <div className={styles.suggestionCategory}>{suggestion.category}</div>
        </motion.div>
      ))}
    </motion.div>
  );
} 