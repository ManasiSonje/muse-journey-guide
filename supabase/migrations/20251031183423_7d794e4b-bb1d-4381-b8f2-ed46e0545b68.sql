-- Create a table to track museum views/searches by users
CREATE TABLE IF NOT EXISTS public.museum_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  museum_id UUID REFERENCES public.museums(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, museum_id)
);

-- Enable RLS
ALTER TABLE public.museum_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own visits
CREATE POLICY "Users can view their own visits"
  ON public.museum_visits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own visits
CREATE POLICY "Users can insert their own visits"
  ON public.museum_visits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own visits
CREATE POLICY "Users can update their own visits"
  ON public.museum_visits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_museum_visits_user_id ON public.museum_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_museum_visits_museum_id ON public.museum_visits(museum_id);

-- Create function to upsert museum visit
CREATE OR REPLACE FUNCTION public.track_museum_visit(p_museum_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.museum_visits (user_id, museum_id, visited_at)
  VALUES (auth.uid(), p_museum_id, NOW())
  ON CONFLICT (user_id, museum_id)
  DO UPDATE SET visited_at = NOW();
END;
$$;