-- Now insert National Museum data
INSERT INTO public.museums (
  name, 
  city, 
  type, 
  description, 
  detailed_timings, 
  reviews, 
  pricing, 
  booking_link
) 
VALUES (
  'National Museum',
  'New Delhi',
  'National Museum',
  'The National Museum in New Delhi is one of the largest museums in India. It houses a vast collection of artifacts and exhibits spanning over 5000 years of Indian history.',
  '{"monday": "10:00-18:00", "tuesday": "Closed", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00", "saturday": "10:00-18:00", "sunday": "10:00-18:00"}'::jsonb,
  '[{"user": "Amit", "rating": 4.5, "comment": "Great collection!"}, {"user": "Priya", "rating": 4.8, "comment": "Loved the art section"}]'::jsonb,
  '{"adult": "₹100", "child": "₹50"}'::jsonb,
  'https://bookmyshow.com/national-museum'
);