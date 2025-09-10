-- Fix aspect ratio names to match expected format
-- Update existing entries to use proper aspect ratio format

-- Update standard aspect ratios
UPDATE aspect_ratios 
SET name = '1:1' 
WHERE generation_type = 'standard' AND (name = 'Square' OR name LIKE '%Square%' OR ratio = 1.0);

UPDATE aspect_ratios 
SET name = '4:3' 
WHERE generation_type = 'standard' AND (name = 'Landscape' OR name LIKE '%4:3%' OR ratio BETWEEN 1.3 AND 1.35);

UPDATE aspect_ratios 
SET name = '16:9' 
WHERE generation_type = 'standard' AND (name = 'Widescreen' OR name LIKE '%16:9%' OR ratio BETWEEN 1.7 AND 1.8);

-- Update dome aspect ratios
UPDATE aspect_ratios 
SET name = '1:1' 
WHERE generation_type = 'dome' AND (name = 'Dome Square' OR name LIKE '%Square%' OR ratio = 1.0);

-- Update 360° aspect ratios to use proper format
UPDATE aspect_ratios 
SET name = '21:9' 
WHERE generation_type = '360' AND (name = '360° Panoramic' OR name LIKE '%Panoramic%' OR ratio BETWEEN 2.3 AND 2.4);

UPDATE aspect_ratios 
SET name = '2:1' 
WHERE generation_type = '360' AND (name = '2:1 Equirectangular' OR name LIKE '%2:1%' OR ratio = 2.0);

-- Insert missing NVIDIA SANA 4K aspect ratios if they don't exist
INSERT INTO aspect_ratios (id, name, description, generation_type, ratio, width, height, is_default, created_at)
VALUES 
  (gen_random_uuid(), '2:1', '4K Equirectangular (4096x2048)', '360', 2.0, 4096, 2048, true, now()),
  (gen_random_uuid(), '1:1', '4K Square (4096x4096)', 'standard', 1.0, 4096, 4096, false, now()),
  (gen_random_uuid(), '4:3', '4K Landscape (4096x3072)', 'standard', 4.0/3.0, 4096, 3072, false, now()),
  (gen_random_uuid(), '16:9', '4K Widescreen (4096x2304)', 'standard', 16.0/9.0, 4096, 2304, false, now())
ON CONFLICT (generation_type, name) DO NOTHING;

-- Ensure all aspect ratios have proper format names
UPDATE aspect_ratios 
SET name = CASE 
  WHEN ratio = 1.0 THEN '1:1'
  WHEN ratio BETWEEN 1.3 AND 1.35 THEN '4:3'
  WHEN ratio BETWEEN 1.4 AND 1.6 THEN '3:2'
  WHEN ratio BETWEEN 1.7 AND 1.8 THEN '16:9'
  WHEN ratio BETWEEN 2.0 AND 2.1 THEN '2:1'
  WHEN ratio BETWEEN 2.3 AND 2.4 THEN '21:9'
  WHEN ratio BETWEEN 0.7 AND 0.8 THEN '3:4'
  WHEN ratio BETWEEN 0.55 AND 0.65 THEN '9:16'
  ELSE name
END
WHERE name NOT SIMILAR TO '[0-9]+:[0-9]+';
