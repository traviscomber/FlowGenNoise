-- Safe update for cubemap generation type support
-- First, check and fix any existing invalid generation_type values

-- Update any invalid generation_type values to 'standard'
UPDATE aspect_ratios 
SET generation_type = 'standard' 
WHERE generation_type NOT IN ('standard', 'dome', '360');

-- Drop the existing constraint
ALTER TABLE aspect_ratios DROP CONSTRAINT IF EXISTS aspect_ratios_generation_type_check;

-- Add the new constraint that includes cubemap
ALTER TABLE aspect_ratios ADD CONSTRAINT aspect_ratios_generation_type_check 
CHECK (generation_type IN ('standard', 'dome', '360', 'cubemap'));

-- Add cubemap aspect ratios
INSERT INTO aspect_ratios (name, ratio, generation_type) VALUES
('Cubemap 4:3', 1.33, 'cubemap'),
('Cubemap Square', 1.0, 'cubemap'),
('Cubemap 16:9', 1.78, 'cubemap')
ON CONFLICT (name) DO NOTHING;

-- Add cubemap column to generation_preferences if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generation_preferences' 
                   AND column_name = 'generate_cubemap') THEN
        ALTER TABLE generation_preferences ADD COLUMN generate_cubemap BOOLEAN DEFAULT true;
    END IF;
END $$;
