-- Fix the search function security issue by setting a proper search path
CREATE OR REPLACE FUNCTION search_museums(
  search_name TEXT DEFAULT NULL,
  search_city TEXT DEFAULT NULL,
  search_type TEXT DEFAULT NULL
) RETURNS SETOF public.museums AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.museums
  WHERE 
    (search_name IS NULL OR name ILIKE '%' || search_name || '%')
    AND (search_city IS NULL OR city ILIKE '%' || search_city || '%')
    AND (search_type IS NULL OR type ILIKE '%' || search_type || '%')
  ORDER BY name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;