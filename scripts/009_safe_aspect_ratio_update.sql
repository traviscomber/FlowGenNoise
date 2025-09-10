-- Safe aspect ratio update script that handles existing entries properly

-- First, let's see what we have and update only what needs changing
-- Update descriptive names to proper format strings

-- Update "Square" to "1:1" for standard generation
UPDATE aspect_ratios 
SET name = '1:1'
WHERE name = 'Square' AND generation_type = 'standard';

-- Update "Dome Square" to "1:1" for dome generation  
UPDATE aspect_ratios 
SET name = '1:1'
WHERE name = 'Dome Square' AND generation_type = 'dome';

-- Update any other descriptive names that might exist
UPDATE aspect_ratios 
SET name = '16:9'
WHERE name LIKE '%16:9%' OR name LIKE '%Widescreen%';

UPDATE aspect_ratios 
SET name = '21:9'
WHERE name LIKE '%21:9%' OR name LIKE '%Ultra%wide%' OR name LIKE '%Panoramic%';

-- Add missing NVIDIA SANA 4K aspect ratios only if they don't exist
-- Use DO blocks to safely insert without conflicts

DO $$
BEGIN
    -- Add 2:1 for 360° if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '2:1' AND generation_type = '360') THEN
        INSERT INTO aspect_ratios (name, generation_type, ratio, width, height, description, is_default)
        VALUES ('2:1', '360', 2.0, 4096, 2048, '4K Equirectangular (NVIDIA SANA)', false);
    END IF;

    -- Add 4K 1:1 for standard if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '1:1' AND generation_type = 'standard' AND width = 4096) THEN
        INSERT INTO aspect_ratios (name, generation_type, ratio, width, height, description, is_default)
        VALUES ('1:1', 'standard', 1.0, 4096, 4096, '4K Square (NVIDIA SANA)', false);
    END IF;

    -- Add other NVIDIA SANA 4K ratios
    IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '4:3' AND generation_type = 'standard' AND width > 2000) THEN
        INSERT INTO aspect_ratios (name, generation_type, ratio, width, height, description, is_default)
        VALUES ('4:3', 'standard', 4.0/3.0, 2304, 1792, '4:3 2K (NVIDIA SANA)', false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '3:2' AND generation_type = 'standard' AND width > 2000) THEN
        INSERT INTO aspect_ratios (name, generation_type, ratio, width, height, description, is_default)
        VALUES ('3:2', 'standard', 3.0/2.0, 2432, 1664, '3:2 2K (NVIDIA SANA)', false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM aspect_ratios WHERE name = '16:9' AND generation_type = 'standard' AND width > 2000) THEN
        INSERT INTO aspect_ratios (name, generation_type, ratio, width, height, description, is_default)
        VALUES ('16:9', 'standard', 16.0/9.0, 2688, 1536, '16:9 2K (NVIDIA SANA)', false);
    END IF;

END $$;
