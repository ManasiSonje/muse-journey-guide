-- Fix search path for search_museums function to resolve security warning
CREATE OR REPLACE FUNCTION public.search_museums(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  city TEXT,
  type TEXT,
  established INTEGER,
  description TEXT,
  address TEXT,
  timings TEXT,
  entry_fee TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  detailed_timings JSONB,
  reviews JSONB,
  pricing JSONB,
  booking_link TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id, m.name, m.city, m.type, m.established, m.description,
    m.address, m.timings, m.entry_fee, m.latitude, m.longitude,
    m.detailed_timings, m.reviews, m.pricing, m.booking_link
  FROM public.museums m
  WHERE 
    m.name ILIKE '%' || search_query || '%' OR
    m.city ILIKE '%' || search_query || '%' OR
    m.type ILIKE '%' || search_query || '%' OR
    m.description ILIKE '%' || search_query || '%';
END;
$$;