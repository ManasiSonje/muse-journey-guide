-- Add new columns to museums table for enhanced structure
ALTER TABLE public.museums 
ADD COLUMN detailed_timings JSONB,
ADD COLUMN reviews JSONB DEFAULT '[]'::jsonb,
ADD COLUMN pricing JSONB,
ADD COLUMN booking_link TEXT;

-- Update existing data with sample structured data
UPDATE public.museums 
SET 
  detailed_timings = CASE 
    WHEN name = 'National Museum' THEN '{"monday": "10:00-18:00", "tuesday": "Closed", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00", "saturday": "10:00-18:00", "sunday": "10:00-18:00"}'::jsonb
    ELSE '{"monday": "10:00-17:00", "tuesday": "10:00-17:00", "wednesday": "10:00-17:00", "thursday": "10:00-17:00", "friday": "10:00-17:00", "saturday": "10:00-17:00", "sunday": "Closed"}'::jsonb
  END,
  reviews = CASE 
    WHEN name = 'National Museum' THEN '[{"user": "Amit", "rating": 4.5, "comment": "Great collection!"}, {"user": "Priya", "rating": 4.8, "comment": "Loved the art section"}]'::jsonb
    ELSE '[]'::jsonb
  END,
  pricing = CASE 
    WHEN name = 'National Museum' THEN '{"adult": "₹100", "child": "₹50"}'::jsonb
    ELSE '{"adult": "₹50", "child": "₹25"}'::jsonb
  END,
  booking_link = CASE 
    WHEN name = 'National Museum' THEN 'https://bookmyshow.com/national-museum'
    ELSE 'https://bookmyshow.com/' || LOWER(REPLACE(name, ' ', '-'))
  END;

-- Create an index on the JSONB columns for better performance
CREATE INDEX idx_museums_detailed_timings ON public.museums USING GIN (detailed_timings);
CREATE INDEX idx_museums_reviews ON public.museums USING GIN (reviews);
CREATE INDEX idx_museums_pricing ON public.museums USING GIN (pricing);