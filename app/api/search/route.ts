import { NextResponse } from 'next/server';
import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || '',
      port: 443,
      protocol: 'https',
    },
  ],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 2,
});

export async function POST(request: Request) {
  const { query } = await request.json();

  try {
    const searchResults = await typesenseClient
      .collections('services')
      .documents()
      .search({
        q: query,
        query_by: 'title,category,keywords,description',
      });

    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
