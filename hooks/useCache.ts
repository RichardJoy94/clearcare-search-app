import { useState, useEffect } from 'react';

interface CacheOptions {
  key: string;
  ttl?: number; // Time to live in milliseconds
}

export function useCache<T>(
  options: CacheOptions,
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(options.key);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const now = Date.now();
          const ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes

          if (now - timestamp < ttl) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const freshData = await fetcher();
        
        // Update cache
        localStorage.setItem(
          options.key,
          JSON.stringify({
            data: freshData,
            timestamp: Date.now(),
          })
        );

        setData(freshData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const invalidateCache = () => {
    localStorage.removeItem(options.key);
  };

  return { data, loading, error, invalidateCache };
} 