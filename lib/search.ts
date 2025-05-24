import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: Number(process.env.TYPESENSE_PORT) || 8108,
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 2,
});

export const servicesCollection = typesenseClient.collections('services');

export async function searchHealthcareServices(query: string, options: any = {}) {
  return servicesCollection.documents().search({
    q: query,
    query_by: 'title,category,description',
    ...options,
  });
}

export async function suggestHealthcareServices(query: string, options: any = {}) {
  return servicesCollection.documents().search({
    q: query,
    query_by: 'title,category',
    prefix: true,
    per_page: 5,
    ...options,
  });
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  location: {
    zipCode: string;
    distance?: number;
  };
} 