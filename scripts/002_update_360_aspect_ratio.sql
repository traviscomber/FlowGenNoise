-- Update 360° aspect ratio to use 2048x1024 for best equirectangular results
-- FLUX 1.1 Pro Ultra supports up to 2048px for optimal 360° panoramic generation

-- First, update the existing 360° Panoramic ratio to use 2048x1024
UPDATE public.aspect_ratios 
SET 
  width = 2048,
  height = 1024,
  description = 'Optimal 2048x1024 equirectangular panorama for FLUX 1.1 Pro Ultra'
WHERE name = '360° Panoramic' AND generation_type = '360';

-- Add a new ultra-high resolution 360° option if it doesn't exist
INSERT INTO public.aspect_ratios (name, ratio, width, height, description, is_default, generation_type) 
VALUES ('360° Ultra HD', 2.000, 2048, 1024, 'Ultra HD 2048x1024 equirectangular for best 360° results', false, '360')
ON CONFLICT (name) DO NOTHING;

-- Update any other 360° ratios to use higher resolution within FLUX limits
UPDATE public.aspect_ratios 
SET 
  width = LEAST(width * 1.42, 2048),  -- Scale up to 2048px max
  height = LEAST(height * 1.42, 1024) -- Maintain aspect ratio
WHERE generation_type = '360' AND width < 2048;
