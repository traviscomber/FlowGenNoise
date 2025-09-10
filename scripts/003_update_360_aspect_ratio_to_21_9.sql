-- Update 360° aspect ratio to use 21:9 (FLUX 1.1 Pro Ultra supported format)
-- This provides better ultra-wide panoramic results than 2:1

UPDATE aspect_ratios 
SET 
  name = '21:9 Ultra-Wide Panoramic',
  ratio = '21:9',
  width = 2048,
  height = 976,
  description = 'Ultra-wide panoramic format optimized for FLUX 1.1 Pro Ultra - superior to 2:1 for equirectangular panoramas'
WHERE generation_type = '360' AND name LIKE '%2:1%';

-- Add additional supported aspect ratios for 360° generation
INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default) VALUES
('16:9 Wide Panoramic', '16:9', 1792, 1008, '360', 'Wide panoramic format for FLUX 1.1 Pro Ultra', false),
('3:2 Classic Panoramic', '3:2', 1440, 960, '360', 'Classic panoramic format for FLUX 1.1 Pro Ultra', false)
ON CONFLICT (generation_type, ratio) DO UPDATE SET
  name = EXCLUDED.name,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  description = EXCLUDED.description;

-- Update dome and standard to use only supported aspect ratios
UPDATE aspect_ratios 
SET description = 'Perfect square format for dome projection - FLUX 1.1 Pro Ultra optimized'
WHERE generation_type = 'dome' AND ratio = '1:1';

UPDATE aspect_ratios 
SET description = 'Perfect square format for standard generation - FLUX 1.1 Pro Ultra optimized'
WHERE generation_type = 'standard' AND ratio = '1:1';
