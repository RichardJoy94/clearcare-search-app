export interface SearchResult {
  id: string;
  title: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  activeCategory: string;
  sortOrder: 'none' | 'lowToHigh' | 'highToLow';
  lastQuery: string;
  totalResultsCount: number;
  visibleCount: number;
  loading: boolean;
  error: string | null;
}

export interface SortingOption {
  label: string;
  value: 'none' | 'lowToHigh' | 'highToLow';
}

export interface TabData {
  label: string;
  content: React.ReactNode;
} 