import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  isLive?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      console.error('YouTube API key not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // First, search for live streams
    const liveSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' museum')}&type=video&eventType=live&maxResults=5&key=${youtubeApiKey}`;
    
    console.log('Searching for live streams:', query);
    const liveResponse = await fetch(liveSearchUrl);
    const liveData = await liveResponse.json();
    
    let videos: YouTubeVideo[] = [];
    
    // Process live streams first
    if (liveData.items && liveData.items.length > 0) {
      console.log(`Found ${liveData.items.length} live streams`);
      videos = liveData.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        isLive: true
      }));
    }
    
    // If no live streams found, search for recent videos
    if (videos.length === 0) {
      console.log('No live streams found, searching for recent videos');
      const recentSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' museum')}&type=video&order=relevance&maxResults=5&publishedAfter=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&key=${youtubeApiKey}`;
      
      const recentResponse = await fetch(recentSearchUrl);
      const recentData = await recentResponse.json();
      
      if (recentData.items && recentData.items.length > 0) {
        console.log(`Found ${recentData.items.length} recent videos`);
        videos = recentData.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
          isLive: false
        }));
      } else {
        // Fallback to general search without date filter
        console.log('No recent videos found, doing general search');
        const generalSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' museum')}&type=video&order=relevance&maxResults=5&key=${youtubeApiKey}`;
        
        const generalResponse = await fetch(generalSearchUrl);
        const generalData = await generalResponse.json();
        
        if (generalData.items && generalData.items.length > 0) {
          console.log(`Found ${generalData.items.length} general videos`);
          videos = generalData.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            isLive: false
          }));
        }
      }
    }

    console.log(`Returning ${videos.length} videos for query: ${query}`);
    
    return new Response(JSON.stringify({ 
      videos: videos,
      hasResults: videos.length > 0,
      query: query
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to search YouTube videos',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});