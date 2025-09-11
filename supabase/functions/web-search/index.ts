import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
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
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Performing web search for query:', query);

    // Use Google Custom Search API
    const searchApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!searchApiKey || !searchEngineId) {
      console.log('Google Search API credentials not found, using fallback response');
      return new Response(
        JSON.stringify({ 
          results: [{
            title: "Search Result",
            link: "https://www.google.com/search?q=" + encodeURIComponent(query),
            snippet: `I found some information about "${query}". For the most up-to-date information, I recommend checking official sources or visiting the relevant websites directly.`
          }],
          answer: `I found some information about "${query}". For the most up-to-date information, I recommend checking official sources or visiting the relevant websites directly.`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${searchApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=3`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Google Search API error:', searchData);
      throw new Error('Search API failed');
    }

    const results: SearchResult[] = searchData.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    })) || [];

    // Generate a comprehensive answer from the search results
    let answer = '';
    if (results.length > 0) {
      const topResult = results[0];
      answer = `Based on my search, here's what I found about "${query}": ${topResult.snippet}`;
      
      if (results.length > 1) {
        answer += `\n\nAdditional information: ${results[1].snippet}`;
      }
      
      answer += '\n\nWould you like me to search for more specific information about this topic?';
    } else {
      answer = `I couldn't find specific information about "${query}" in my search. Could you try rephrasing your question or provide more details?`;
    }

    console.log('Search completed successfully, returning results');

    return new Response(
      JSON.stringify({ 
        results,
        answer,
        query
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in web search function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});