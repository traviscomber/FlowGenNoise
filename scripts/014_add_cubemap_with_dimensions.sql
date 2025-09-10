-- First, update the check constraint to allow 'cubemap' as a valid generation type
ALTER TABLE aspect_ratios DROP CONSTRAINT IF EXISTS aspect_ratios_generation_type_check;
ALTER TABLE aspect_ratios ADD CONSTRAINT aspect_ratios_generation_type_check 
CHECK (generation_type IN ('standard', 'dome', '360', 'cubemap'));

-- Add cubemap generation preferences column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generation_preferences' 
                   AND column_name = 'generate_cubemap') THEN
        ALTER TABLE generation_preferences ADD COLUMN generate_cubemap BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add cubemap aspect ratios with proper dimensions
INSERT INTO aspect_ratios (name, ratio, width, height, generation_type)
VALUES 
    ('Cubemap 4:3 HD', 1.33, 1024, 768, 'cubemap'),
    ('Cubemap 4:3 Standard', 1.33, 1280, 960, 'cubemap'),
    ('Cubemap 4:3 High', 1.33, 1600, 1200, 'cubemap')
ON CONFLICT (name) DO NOTHING;
