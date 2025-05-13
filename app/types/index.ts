export interface SearchResult {
  id: string;
  title: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  location?: string;
  distance?: number;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  providerUrl?: string;
  _highlight?: {
    title?: string[];
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