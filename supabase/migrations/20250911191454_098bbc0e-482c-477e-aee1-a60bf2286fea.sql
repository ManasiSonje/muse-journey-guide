-- Add a sequence for the id column if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS museums_id_seq;

-- Set the id column to use the sequence as default
ALTER TABLE public.museums 
ALTER COLUMN id SET DEFAULT nextval('museums_id_seq'::regclass);

-- Set the sequence ownership
ALTER SEQUENCE museums_id_seq OWNED BY public.museums.id;

-- Update the sequence to start from the current max id + 1
SELECT setval('museums_id_seq', COALESCE((SELECT MAX(id) FROM public.museums), 0) + 1, false);