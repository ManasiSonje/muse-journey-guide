-- Create museums table
CREATE TABLE public.museums (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  established TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  timings TEXT,
  entry_fee TEXT,
  contact TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.museums ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (museums are public data)
CREATE POLICY "Museums are viewable by everyone" 
ON public.museums 
FOR SELECT 
USING (true);

-- Only authenticated admins can modify museums (optional - you can adjust this)
CREATE POLICY "Only authenticated users can insert museums" 
ON public.museums 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update museums" 
ON public.museums 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better search performance
CREATE INDEX idx_museums_name ON public.museums (name);
CREATE INDEX idx_museums_city ON public.museums (city);
CREATE INDEX idx_museums_type ON public.museums (type);
CREATE INDEX idx_museums_name_search ON public.museums USING gin(to_tsvector('english', name));
CREATE INDEX idx_museums_description_search ON public.museums USING gin(to_tsvector('english', description));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_museums_updated_at
BEFORE UPDATE ON public.museums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert museum data from your JSON
INSERT INTO public.museums (id, name, city, established, type, description, address, timings, entry_fee, contact, website) VALUES
(1, 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', 'Mumbai', '1922', 'Art, Archaeology, Natural History', 'Houses ~50,000 artefacts across art, archaeology and natural history, including maritime heritage galleries.', NULL, NULL, NULL, NULL, NULL),
(2, 'Dr. Bhau Daji Lad Museum', 'Mumbai', '1872', 'Decorative & Industrial Arts', 'Mumbai''s oldest museum focused on decorative and industrial arts.', NULL, NULL, NULL, NULL, NULL),
(3, 'Raja Dinkar Kelkar Museum', 'Pune', NULL, 'Folk Art & Ancient Artifacts', 'Home to over 20,000 Indian cultural artefacts including sculptures, utensils and music instruments.', NULL, NULL, NULL, NULL, NULL),
(4, 'Nagpur Central Museum (Ajab Bangla)', 'Nagpur', '1863', 'Archaeology, Anthropology, Natural History', 'One of the oldest museums in India with diverse collections.', NULL, NULL, NULL, NULL, NULL),
(5, 'Cavalry Tank Museum', 'Ahmednagar', NULL, 'Military / Armored Vehicles', 'Asia''s only tank museum, showcasing WW-II era tanks and armoured vehicles.', NULL, NULL, NULL, NULL, NULL),
(6, 'Gargoti Museum', 'Sinnar (Nashik District)', NULL, 'Mineralogical Museum', 'India''s only gem, mineral and fossil museum with largest collection of Indian zeolite minerals & crystals.', NULL, NULL, NULL, NULL, NULL),
(7, 'National Museum of Indian Cinema', 'Mumbai', '2019', 'Film Museum', 'Museum dedicated to history and development of Indian cinema housed across restored heritage and modern galleries.', NULL, NULL, NULL, NULL, NULL),
(8, 'Zapurza Museum of Art & Culture', 'Pune District', '2022-05-19', 'Art & Cultural Heritage', 'Art museum showcasing heirlooms, textiles, paintings, rotating artifacts collected over decades.', NULL, NULL, NULL, NULL, NULL),
(9, 'National Gallery of Modern Art, Mumbai', 'Mumbai', NULL, 'Modern Art Gallery', 'Museum of modern art in Mumbai, under NGMA network.', NULL, NULL, NULL, NULL, NULL),
(10, 'Joshi''s Museum of Miniature Railway', 'Pune', NULL, 'Miniature Railway', 'Specialty museum showcasing detailed working miniature railway models.', NULL, NULL, NULL, NULL, NULL);

-- Create a function for advanced search
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
$$ LANGUAGE plpgsql SECURITY DEFINER;