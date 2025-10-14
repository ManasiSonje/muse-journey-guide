-- Create museums table with all fields
CREATE TABLE public.museums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT NOT NULL,
  established INTEGER,
  description TEXT,
  address TEXT,
  timings TEXT,
  entry_fee TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  detailed_timings JSONB DEFAULT '{}',
  reviews JSONB DEFAULT '[]',
  pricing JSONB DEFAULT '{}',
  booking_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for location-based queries
CREATE INDEX idx_museums_location ON public.museums(latitude, longitude);

-- Create index for city searches
CREATE INDEX idx_museums_city ON public.museums(city);

-- Enable RLS on museums
ALTER TABLE public.museums ENABLE ROW LEVEL SECURITY;

-- Allow public read access to museums
CREATE POLICY "Museums are publicly readable"
ON public.museums FOR SELECT
TO public
USING (true);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are publicly readable"
ON public.profiles FOR SELECT
TO public
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to search museums
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

-- Insert sample museum data
INSERT INTO public.museums (name, city, type, established, description, address, timings, entry_fee, latitude, longitude, detailed_timings, reviews, pricing, booking_link) VALUES
('National Museum', 'New Delhi', 'History', 1949, 'One of the largest museums in India with extensive collection of artifacts', 'Janpath, New Delhi', '10:00 AM - 6:00 PM', '₹20 for Indians, ₹650 for Foreigners', 28.6119, 77.2196, 
'{"Monday": "Closed", "Tuesday": "10:00 AM - 6:00 PM", "Wednesday": "10:00 AM - 6:00 PM", "Thursday": "10:00 AM - 6:00 PM", "Friday": "10:00 AM - 6:00 PM", "Saturday": "10:00 AM - 6:00 PM", "Sunday": "10:00 AM - 6:00 PM"}',
'[{"rating": 5, "comment": "Amazing collection of historical artifacts", "author": "Rajesh Kumar"}, {"rating": 4, "comment": "Great museum but needs better maintenance", "author": "Priya Sharma"}]',
'{"indian_adult": "20", "indian_child": "10", "foreign_adult": "650", "foreign_child": "350"}',
'https://nationalmuseumindia.gov.in/'),

('Indian Museum', 'Kolkata', 'History', 1814, 'The oldest and largest museum in India', '27, Jawaharlal Nehru Rd, Kolkata', '10:00 AM - 5:00 PM', '₹50 for Indians, ₹500 for Foreigners', 22.5579, 88.3522,
'{"Monday": "Closed", "Tuesday": "10:00 AM - 5:00 PM", "Wednesday": "10:00 AM - 5:00 PM", "Thursday": "10:00 AM - 5:00 PM", "Friday": "10:00 AM - 5:00 PM", "Saturday": "10:00 AM - 5:00 PM", "Sunday": "10:00 AM - 5:00 PM"}',
'[{"rating": 5, "comment": "Must visit in Kolkata", "author": "Amit Das"}, {"rating": 4, "comment": "Rich history and culture", "author": "Sneha Roy"}]',
'{"indian_adult": "50", "indian_child": "20", "foreign_adult": "500", "foreign_child": "250"}',
'https://indianmuseumkolkata.org/'),

('Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', 'Mumbai', 'History', 1922, 'Formerly Prince of Wales Museum, showcasing Indian art and history', '159-161, Mahatma Gandhi Road, Mumbai', '10:15 AM - 6:00 PM', '₹85 for Indians, ₹500 for Foreigners', 18.9269, 72.8324,
'{"Monday": "Closed", "Tuesday": "10:15 AM - 6:00 PM", "Wednesday": "10:15 AM - 6:00 PM", "Thursday": "10:15 AM - 6:00 PM", "Friday": "10:15 AM - 6:00 PM", "Saturday": "10:15 AM - 6:00 PM", "Sunday": "10:15 AM - 6:00 PM"}',
'[{"rating": 5, "comment": "Beautiful architecture and exhibits", "author": "Vikram Patel"}, {"rating": 5, "comment": "World class museum", "author": "Meera Joshi"}]',
'{"indian_adult": "85", "indian_child": "40", "foreign_adult": "500", "foreign_child": "250"}',
'https://csmvs.in/'),

('Government Museum', 'Chennai', 'History', 1851, 'Second oldest museum in India with bronze gallery', 'Pantheon Road, Egmore, Chennai', '9:30 AM - 5:00 PM', '₹15 for Indians, ₹250 for Foreigners', 13.0661, 80.2589,
'{"Monday": "Closed", "Tuesday": "9:30 AM - 5:00 PM", "Wednesday": "9:30 AM - 5:00 PM", "Thursday": "9:30 AM - 5:00 PM", "Friday": "Closed", "Saturday": "9:30 AM - 5:00 PM", "Sunday": "9:30 AM - 5:00 PM"}',
'[{"rating": 4, "comment": "Excellent bronze collection", "author": "Suresh Kumar"}, {"rating": 4, "comment": "Good for history lovers", "author": "Lakshmi Iyer"}]',
'{"indian_adult": "15", "indian_child": "10", "foreign_adult": "250", "foreign_child": "150"}',
'https://chennaimuseum.org/'),

('Salar Jung Museum', 'Hyderabad', 'Art', 1951, 'One of three National Museums of India with largest one-man collection', 'Darushifa, Hyderabad', '10:00 AM - 5:00 PM', '₹50 for Indians, ₹500 for Foreigners', 17.3714, 78.4804,
'{"Monday": "10:00 AM - 5:00 PM", "Tuesday": "10:00 AM - 5:00 PM", "Wednesday": "10:00 AM - 5:00 PM", "Thursday": "10:00 AM - 5:00 PM", "Friday": "Closed", "Saturday": "10:00 AM - 5:00 PM", "Sunday": "10:00 AM - 5:00 PM"}',
'[{"rating": 5, "comment": "Incredible collection", "author": "Mohammed Ali"}, {"rating": 4, "comment": "Must see the Veiled Rebecca statue", "author": "Kavya Reddy"}]',
'{"indian_adult": "50", "indian_child": "20", "foreign_adult": "500", "foreign_child": "250"}',
'https://salarjungmuseum.in/'),

('National Science Centre', 'New Delhi', 'Science', 1992, 'Interactive science museum with hands-on exhibits', 'Gate No 1, Bhairon Road, Pragati Maidan, New Delhi', '9:30 AM - 5:30 PM', '₹70 for Indians, ₹350 for Foreigners', 28.6123, 77.2426,
'{"Monday": "Closed", "Tuesday": "9:30 AM - 5:30 PM", "Wednesday": "9:30 AM - 5:30 PM", "Thursday": "9:30 AM - 5:30 PM", "Friday": "9:30 AM - 5:30 PM", "Saturday": "9:30 AM - 5:30 PM", "Sunday": "9:30 AM - 5:30 PM"}',
'[{"rating": 5, "comment": "Great for kids", "author": "Neha Gupta"}, {"rating": 4, "comment": "Fun and educational", "author": "Rohan Khanna"}]',
'{"indian_adult": "70", "indian_child": "30", "foreign_adult": "350", "foreign_child": "200"}',
'https://nscdelhi.gov.in/');