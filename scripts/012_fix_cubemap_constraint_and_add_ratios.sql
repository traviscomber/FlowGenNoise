-- First, update the check constraint to allow 'cubemap' as a valid generation type
ALTER TABLE aspect_ratios DROP CONSTRAINT IF EXISTS aspect_ratios_generation_type_check;
ALTER TABLE aspect_ratios ADD CONSTRAINT aspect_ratios_generation_type_check 
CHECK (generation_type IN ('standard', 'dome', '360', 'cubemap'));

-- Add cubemap generation preference column if it doesn't exist
ALTER TABLE generation_preferences ADD COLUMN IF NOT EXISTS generate_cubemap BOOLEAN DEFAULT true;

-- Add cubemap aspect ratios
INSERT INTO aspect_ratios (name, ratio, generation_type) VALUES
('4:3', 1.33, 'cubemap'),
('Cubemap Square', 1.0, 'cubemap'),
('Cubemap Wide', 1.5, 'cubemap')
ON CONFLICT (name) DO NOTHING;
