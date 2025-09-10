-- Add cubemap support to FlowSketch Art Generator
-- This script safely adds cubemap generation type and preferences

-- Step 1: Add cubemap column to generation_preferences table
ALTER TABLE generation_preferences 
ADD COLUMN IF NOT EXISTS generate_cubemap boolean DEFAULT true;

-- Step 2: Drop the existing check constraint on aspect_ratios
ALTER TABLE aspect_ratios 
DROP CONSTRAINT IF EXISTS aspect_ratios_generation_type_check;

-- Step 3: Create new check constraint that includes cubemap
ALTER TABLE aspect_ratios 
ADD CONSTRAINT aspect_ratios_generation_type_check 
CHECK (generation_type IN ('standard', 'dome', '360', 'cubemap'));

-- Step 4: Add cubemap aspect ratios (4:3 format)
INSERT INTO aspect_ratios (id, name, ratio, width, height, generation_type, is_default, description)
VALUES 
  (gen_random_uuid(), '4:3', 4.0/3.0, 1024, 768, 'cubemap', true, 'Cubemap HD 4:3 format for environment mapping'),
  (gen_random_uuid(), '4:3 Standard', 4.0/3.0, 1280, 960, 'cubemap', false, 'Cubemap Standard 4:3 format'),
  (gen_random_uuid(), '4:3 High', 4.0/3.0, 1600, 1200, 'cubemap', false, 'Cubemap High resolution 4:3 format')
ON CONFLICT (name) DO NOTHING;
