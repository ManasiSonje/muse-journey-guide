import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  isLive?: boolean;
  platform: 'youtube' | 'vimeo' | 'dailymotion' | 'fallback';
  embedUrl: string;
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

    let videos: Video[] = [];

    // Try YouTube first
    videos = await searchYouTubeVideos(query);
    
    // If YouTube fails or has no results, try other platforms
    if (videos.length === 0) {
      console.log('YouTube search failed, trying alternative platforms');
      videos = await searchAlternativePlatforms(query);
    }
    
    // If still no results, provide fallback content
    if (videos.length === 0) {
      console.log('No videos found on any platform, providing fallback content');
      videos = await getFallbackVideos(query);
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
    console.error('Error in video search function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to search for videos',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchYouTubeVideos(query: string): Promise<Video[]> {
  try {
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      console.error('YouTube API key not configured');
      return [];
    }

    console.log('Searching YouTube for:', query);
    // Use the exact format specified by the user
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${youtubeApiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return [];
    }
    
    if (data.items && data.items.length > 0) {
      console.log(`Found ${data.items.length} YouTube videos`);
      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        isLive: false,
        platform: 'youtube' as const,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=0&rel=0`
      }));
      return videos;
    }
    
    return [];
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

async function searchAlternativePlatforms(query: string): Promise<Video[]> {
  const videos: Video[] = [];
  
  try {
    // Try Vimeo search using their API
    console.log('Searching Vimeo for:', query);
    const vimeoResponse = await fetch(`https://api.vimeo.com/videos?query=${encodeURIComponent(query + ' museum')}&per_page=3&sort=relevant`, {
      headers: {
        'Authorization': 'Bearer ' + (Deno.env.get('VIMEO_ACCESS_TOKEN') || ''),
        'Content-Type': 'application/json'
      }
    });
    
    if (vimeoResponse.ok) {
      const vimeoData = await vimeoResponse.json();
      if (vimeoData.data && vimeoData.data.length > 0) {
        console.log(`Found ${vimeoData.data.length} Vimeo videos`);
        const vimeoVideos = vimeoData.data.map((item: any) => ({
          id: item.uri.split('/').pop(),
          title: item.name,
          description: item.description || '',
          thumbnail: item.pictures?.sizes?.[0]?.link || '',
          publishedAt: item.created_time,
          channelTitle: item.user?.name || 'Vimeo',
          isLive: false,
          platform: 'vimeo' as const,
          embedUrl: `https://player.vimeo.com/video/${item.uri.split('/').pop()}`
        }));
        videos.push(...vimeoVideos);
      }
    }
  } catch (error) {
    console.error('Vimeo search error:', error);
  }
  
  return videos;
}

async function getFallbackVideos(query: string): Promise<Video[]> {
  // Provide curated fallback content for popular museums or general museum content
  const fallbackVideos: Video[] = [
    {
      id: 'c1f45LzAciE',
      title: 'Virtual Museum Tour - World\'s Greatest Museums',
      description: 'Take a virtual tour of the world\'s most famous museums and their incredible collections.',
      thumbnail: 'https://img.youtube.com/vi/c1f45LzAciE/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      channelTitle: 'Museum Tours',
      isLive: false,
      platform: 'fallback' as const,
      embedUrl: 'https://www.youtube.com/embed/c1f45LzAciE?autoplay=0&rel=0'
    },
    {
      id: 'YuR0VGKJ0iY',
      title: 'The Louvre Museum Virtual Tour',
      description: 'Explore the famous Louvre Museum in Paris with this virtual tour.',
      thumbnail: 'https://img.youtube.com/vi/YuR0VGKJ0iY/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      channelTitle: 'Art History',
      isLive: false,
      platform: 'fallback' as const,
      embedUrl: 'https://www.youtube.com/embed/YuR0VGKJ0iY?autoplay=0&rel=0'
    },
    {
      id: 'ziw7NZyP0AE',
      title: 'Museum of Natural History Tour',
      description: 'Discover the wonders of natural history in this comprehensive museum tour.',
      thumbnail: 'https://img.youtube.com/vi/ziw7NZyP0AE/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      channelTitle: 'Science Museums',
      isLive: false,
      platform: 'fallback' as const,
      embedUrl: 'https://www.youtube.com/embed/ziw7NZyP0AE?autoplay=0&rel=0'
    }
  ];
  
  console.log(`Providing ${fallbackVideos.length} fallback videos for query: ${query}`);
  return fallbackVideos;
}