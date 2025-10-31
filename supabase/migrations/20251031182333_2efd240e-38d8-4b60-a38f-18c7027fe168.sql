-- Create museums table
CREATE TABLE IF NOT EXISTS public.museums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT,
  established INTEGER,
  description TEXT,
  address TEXT,
  timings TEXT,
  entry_fee TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  detailed_timings JSONB,
  reviews JSONB,
  pricing JSONB,
  booking_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.museums ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Museums are viewable by everyone"
  ON public.museums
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Authenticated users can insert museums"
  ON public.museums
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_museums_name ON public.museums(name);
CREATE INDEX IF NOT EXISTS idx_museums_city ON public.museums(city);