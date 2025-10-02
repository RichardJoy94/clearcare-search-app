import { NextResponse } from 'next/server';
import { suggestHealthcareServices } from '@/lib/search';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use Typesense for suggestions
    const searchResults = await suggestHealthcareServices(query);

    const suggestions = (searchResults.hits || []).map((hit: any) => {
      const doc = hit.document || {};
      return {
        id: doc.id,
        display_name: doc.display_name,
        category: doc.category,
      };
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
} 