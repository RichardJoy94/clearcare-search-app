export interface SearchResult {
  id: string;
  display_name: string;
  category: string;
  description: string;
  min_price: number;
  max_price: number;
  location?: string;
  distance?: number;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  providerUrl?: string;
  _highlight?: {
    display_name?: string[];
    description?: string[];
  };
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
  userZipCode: string;
  maxDistance: number;
}

export interface TabData {
  label: string;
  content: React.ReactNode;
}

export interface LocationFilter {
  zipCode: string;
  maxDistance: number;
}

export interface SearchSuggestion {
  id: string;
  display_name: string;
  category: string;
} 