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
        highlight_full_fields: 'title,description',
        highlight_affix_num_tokens: 5,
        highlight_start_tag: '<mark>',
        highlight_end_tag: '</mark>',
      });

    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
