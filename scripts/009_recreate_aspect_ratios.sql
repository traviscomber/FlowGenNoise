-- Delete all existing aspect ratios and recreate with correct names to avoid unique constraint issues
-- Clear existing aspect ratios to avoid unique constraint conflicts
DELETE FROM aspect_ratios;

-- Insert standard aspect ratios with correct names for all models
INSERT INTO aspect_ratios (id, name, description, generation_type, ratio, width, height, is_default, created_at) VALUES
-- Standard generation aspect ratios
(gen_random_uuid(), '1:1', 'Square', 'standard', 1.0, 1024, 1024, true, now()),
(gen_random_uuid(), '4:3', 'Classic', 'standard', 4.0/3.0, 1024, 768, false, now()),
(gen_random_uuid(), '3:2', 'Photo', 'standard', 3.0/2.0, 1024, 683, false, now()),
(gen_random_uuid(), '16:9', 'Widescreen', 'standard', 16.0/9.0, 1024, 576, false, now()),

-- Dome generation aspect ratios (fisheye 180°)
(gen_random_uuid(), '1:1', 'Dome Square', 'dome', 1.0, 1024, 1024, true, now()),
(gen_random_uuid(), '4:3', 'Dome Classic', 'dome', 4.0/3.0, 1024, 768, false, now()),

-- 360° panoramic aspect ratios
(gen_random_uuid(), '21:9', '360° Ultra Wide', 'panorama360', 21.0/9.0, 2688, 1152, false, now()),
(gen_random_uuid(), '2:1', '360° Equirectangular', 'panorama360', 2.0, 2048, 1024, true, now()),

-- NVIDIA SANA 4K aspect ratios
(gen_random_uuid(), '1:1', 'SANA 4K Square', 'standard', 1.0, 4096, 4096, false, now()),
(gen_random_uuid(), '4:3', 'SANA 4K Classic', 'standard', 4.0/3.0, 4096, 3072, false, now()),
(gen_random_uuid(), '3:2', 'SANA 4K Photo', 'standard', 3.0/2.0, 4096, 2731, false, now()),
(gen_random_uuid(), '16:9', 'SANA 4K Widescreen', 'standard', 16.0/9.0, 4096, 2304, false, now()),
(gen_random_uuid(), '21:9', 'SANA 4K Ultra Wide', 'standard', 21.0/9.0, 4096, 1707, false, now()),
(gen_random_uuid(), '2:1', 'SANA 4K Equirectangular', 'panorama360', 2.0, 4096, 2048, false, now());
