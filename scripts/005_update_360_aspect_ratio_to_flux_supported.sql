-- Update 360° aspect ratio to use FLUX 1.1 Pro Ultra supported format
-- 21:9 (2.33) is the closest wide format to 2:1 (2.0) that's good for panoramic content

UPDATE aspect_ratios 
SET 
  name = '21:9',
  ratio = 21.0/9.0,
  description = '21:9 Ultra-Wide (Best for 360° Panoramic)'
WHERE generation_type = '360' AND name = '360° Panoramic';

-- Also update any other 360° entries to use supported FLUX ratios
UPDATE aspect_ratios 
SET 
  name = '16:9',
  ratio = 16.0/9.0,
  description = '16:9 Widescreen'
WHERE generation_type = '360' AND name = '16:9 Widescreen';

-- Ensure we have the main 360° option with 21:9 as default
INSERT INTO aspect_ratios (generation_type, name, ratio, width, height, description, is_default)
VALUES ('360', '21:9', 21.0/9.0, 2048, 878, '21:9 Ultra-Wide (Best for 360° Panoramic)', true)
ON CONFLICT DO NOTHING;
