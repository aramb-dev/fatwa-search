import { NextResponse } from 'next/server';

/**
 * YouTube Data API Route Handler
 * Protects API keys by executing YouTube searches server-side
 *
 * Query Parameters:
 * @param {string} q - Search query (required)
 * @param {string} channelId - YouTube channel ID to search within (required)
 * @param {string} maxResults - Maximum number of results to return (default: 5)
 *
 * @returns {NextResponse} JSON response with video results or error
 *
 * @example
 * GET /api/youtube?q=tawheed&channelId=UCFjzJYgxHjk44AFoEwwgPjg&maxResults=5
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const channelId = searchParams.get('channelId');
    const maxResults = searchParams.get('maxResults') || '5';

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Check if API credentials are configured
    // Support both new (YOUTUBE_API_KEY) and legacy (REACT_APP_*) variable names
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.REACT_APP_YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API credentials are not configured' },
        { status: 500 }
      );
    }

    // Make request to YouTube Data API
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&key=${apiKey}&type=video&maxResults=${maxResults}&channelId=${channelId}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      // Handle quota exceeded specifically
      if (
        data.error.code === 403 &&
        data.error.errors?.some(
          (err) =>
            err.reason === 'quotaExceeded' || err.message?.includes('quota')
        )
      ) {
        return NextResponse.json(
          { error: 'QUOTA_EXCEEDED' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: data.error.message || 'YouTube API error' },
        { status: data.error.code || 500 }
      );
    }

    // Return video results
    return NextResponse.json({
      items: data.items || [],
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
