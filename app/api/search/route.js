import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const site = searchParams.get('site');
    const start = searchParams.get('start') || '1';

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Check if API credentials are configured
    if (!process.env.GOOGLE_API_KEY || !process.env.SEARCH_ENGINE_ID) {
      return NextResponse.json(
        { error: 'Search API credentials are not configured' },
        { status: 500 }
      );
    }

    // Build search query with site restriction if provided
    const searchQuery = site ? `site:${site} ${query}` : query;

    // Make request to Google Custom Search API
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${
      process.env.GOOGLE_API_KEY
    }&cx=${
      process.env.SEARCH_ENGINE_ID
    }&q=${encodeURIComponent(searchQuery)}&start=${start}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Search API error' },
        { status: data.error.code || 500 }
      );
    }

    // Return search results
    return NextResponse.json({
      items: data.items || [],
      searchInformation: data.searchInformation,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
