-- Add latitude and longitude columns to museums table for location-based features
ALTER TABLE public.museums 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for location queries
CREATE INDEX IF NOT EXISTS idx_museums_location ON public.museums(latitude, longitude);

COMMENT ON COLUMN public.museums.latitude IS 'Latitude coordinate of the museum';
COMMENT ON COLUMN public.museums.longitude IS 'Longitude coordinate of the museum';