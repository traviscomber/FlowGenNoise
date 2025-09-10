-- Fix existing aspect ratio names to match expected format
-- Update descriptive names to proper format strings

-- Update existing entries to use proper format names
UPDATE aspect_ratios 
SET name = '1:1' 
WHERE name = 'Square' OR name = 'Standard Square' OR name LIKE '%Square%';

UPDATE aspect_ratios 
SET name = '21:9' 
WHERE name = 'Panoramic' OR name = '360° Panoramic' OR name LIKE '%Panoramic%';

UPDATE aspect_ratios 
SET name = '16:9' 
WHERE name = 'Widescreen' OR name LIKE '%Widescreen%';

UPDATE aspect_ratios 
SET name = '4:3' 
WHERE name = 'Classic' OR name LIKE '%Classic%';

UPDATE aspect_ratios 
SET name = '3:2' 
WHERE name = 'Photo' OR name LIKE '%Photo%';

-- Add missing NVIDIA SANA 4K aspect ratios if they don't exist
INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '2:1', 2.0, 4096, 2048, '360', 'True 2:1 Equirectangular 4K', false
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '2:1' AND generation_type = '360');

INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '4:3', 4.0/3.0, 2304, 1792, 'standard', 'SANA 4:3 2K', false
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '4:3' AND generation_type = 'standard');

INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '3:4', 3.0/4.0, 1792, 2304, 'standard', 'SANA 3:4 2K', false
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '3:4' AND generation_type = 'standard');

INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '16:9', 16.0/9.0, 2688, 1536, 'standard', 'SANA 16:9 2K', false
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '16:9' AND generation_type = 'standard');

INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '9:16', 9.0/16.0, 1536, 2688, 'standard', 'SANA 9:16 2K', false
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '9:16' AND generation_type = 'standard');

-- Ensure 1:1 exists for all generation types
INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '1:1', 1.0, 2048, 2048, 'standard', 'SANA Square 2K', true
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '1:1' AND generation_type = 'standard');

INSERT INTO aspect_ratios (name, ratio, width, height, generation_type, description, is_default)
SELECT '1:1', 1.0, 2048, 2048, 'dome', 'SANA Dome Square 2K', true
WHERE NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '1:1' AND generation_type = 'dome');
