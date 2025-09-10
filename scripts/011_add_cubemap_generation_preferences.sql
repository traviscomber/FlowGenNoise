-- Add cubemap column to generation_preferences table
ALTER TABLE generation_preferences 
ADD COLUMN IF NOT EXISTS generate_cubemap BOOLEAN DEFAULT true;

-- Add cubemap aspect ratios to aspect_ratios table
INSERT INTO aspect_ratios (id, name, generation_type, width, height, ratio, is_default, description)
VALUES 
  (gen_random_uuid(), '4:3', 'cubemap', 1024, 768, 4.0/3.0, true, 'Standard 4:3 cubemap format'),
  (gen_random_uuid(), '16:12', 'cubemap', 1600, 1200, 4.0/3.0, false, 'High resolution 4:3 cubemap'),
  (gen_random_uuid(), '2048x1536', 'cubemap', 2048, 1536, 4.0/3.0, false, '2K 4:3 cubemap format')
ON CONFLICT (name) DO NOTHING;
