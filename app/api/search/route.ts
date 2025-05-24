import { NextResponse } from 'next/server';
import { searchHealthcareServices } from '@/lib/search';

export async function POST(request: Request) {
  const { query } = await request.json();

  try {
    const searchResults = await searchHealthcareServices(query, {
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
