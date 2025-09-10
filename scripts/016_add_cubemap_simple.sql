-- Add cubemap aspect ratios using existing 'standard' generation type to avoid constraint issues
-- This approach is safer and doesn't require schema changes

-- Add cubemap 4:3 aspect ratios
INSERT INTO aspect_ratios (name, ratio, width, height, generation_type) 
VALUES 
  ('Cubemap HD 4:3', 1.33, 1024, 768, 'standard'),
  ('Cubemap Standard 4:3', 1.33, 1280, 960, 'standard'),
  ('Cubemap High 4:3', 1.33, 1600, 1200, 'standard')
ON CONFLICT (name) DO NOTHING;

-- Add cubemap column to generation_preferences
ALTER TABLE generation_preferences 
ADD COLUMN IF NOT EXISTS generate_cubemap BOOLEAN DEFAULT true;
