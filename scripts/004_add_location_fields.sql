-- Add latitude and longitude columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create an index for faster location-based queries
CREATE INDEX IF NOT EXISTS properties_location_idx ON public.properties(latitude, longitude);
