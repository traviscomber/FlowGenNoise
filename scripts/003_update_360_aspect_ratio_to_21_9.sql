-- Update 360° aspect ratio to use 21:9 (FLUX 1.1 Pro Ultra supported format)
-- This provides better ultra-wide panoramic results than 2:1

-- Fix ratio column to use numeric values instead of strings
UPDATE aspect_ratios 
SET 
  name = '21:9 Ultra-Wide Panoramic',
  ratio = 21.0/9.0,
  width = 2048,
  height = 976,
  description = 'Ultra-wide panoramic format optimized for FLUX 1.1 Pro Ultra - superior to 2:1 for equirectangular panoramas'
WHERE generation_type = '360' AND name LIKE '%2:1%';

-- Remove ON CONFLICT clause since there's no unique constraint on (generation_type, ratio)
-- Add additional supported aspect ratios for 360° generation using INSERT OR UPDATE pattern
DO $$
BEGIN
  -- Insert 16:9 Wide Panoramic if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE generation_type = '360' AND name = '16:9 Wide Panoramic') THEN
    INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default) VALUES
    ('16:9 Wide Panoramic', 16.0/9.0, 1792, 1008, '360', 'Wide panoramic format for FLUX 1.1 Pro Ultra', false);
  END IF;
  
  -- Insert 3:2 Classic Panoramic if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE generation_type = '360' AND name = '3:2 Classic Panoramic') THEN
    INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default) VALUES
    ('3:2 Classic Panoramic', 3.0/2.0, 1440, 960, '360', 'Classic panoramic format for FLUX 1.1 Pro Ultra', false);
  END IF;
END $$;

-- Update dome and standard to use only supported aspect ratios
UPDATE aspect_ratios 
SET description = 'Perfect square format for dome projection - FLUX 1.1 Pro Ultra optimized'
WHERE generation_type = 'dome' AND ratio = 1.0;

UPDATE aspect_ratios 
SET description = 'Perfect square format for standard generation - FLUX 1.1 Pro Ultra optimized'
WHERE generation_type = 'standard' AND ratio = 1.0;
