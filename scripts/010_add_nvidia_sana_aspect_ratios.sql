-- Add NVIDIA SANA 4K aspect ratios to database
-- These are new entries with unique names to avoid constraint violations

-- Added ON CONFLICT DO NOTHING to prevent duplicate key violations

-- NVIDIA SANA 4K Standard aspect ratios
INSERT INTO aspect_ratios (generation_type, name, description, ratio, width, height, is_default)
VALUES 
  ('standard', 'SANA 4K Square', 'NVIDIA SANA 4K Square format', 1.0, 4096, 4096, false),
  ('standard', 'SANA 4K 16:9', 'NVIDIA SANA 4K Widescreen', 1.78, 3840, 2160, false),
  ('standard', 'SANA 4K 3:2', 'NVIDIA SANA 4K Photography', 1.5, 3840, 2560, false),
  ('standard', 'SANA 4K 4:3', 'NVIDIA SANA 4K Classic', 1.33, 3840, 2880, false)
ON CONFLICT (name) DO NOTHING;

-- NVIDIA SANA 4K Dome aspect ratios  
INSERT INTO aspect_ratios (generation_type, name, description, ratio, width, height, is_default)
VALUES 
  ('dome', 'SANA 4K Dome Square', 'NVIDIA SANA 4K Dome Square', 1.0, 4096, 4096, false),
  ('dome', 'SANA 4K Dome 4:3', 'NVIDIA SANA 4K Dome Classic', 1.33, 3840, 2880, false)
ON CONFLICT (name) DO NOTHING;

-- NVIDIA SANA 4K 360° aspect ratios (including true 2:1)
INSERT INTO aspect_ratios (generation_type, name, description, ratio, width, height, is_default)
VALUES 
  ('360', 'SANA 4K 2:1', 'NVIDIA SANA True 2:1 Equirectangular', 2.0, 4096, 2048, true),
  ('360', 'SANA 4K 21:9', 'NVIDIA SANA Ultra-wide Panoramic', 2.33, 4096, 1755, false),
  ('360', 'SANA 4K 16:9', 'NVIDIA SANA Wide Panoramic', 1.78, 3840, 2160, false)
ON CONFLICT (name) DO NOTHING;

-- NVIDIA SANA 2K aspect ratios for compatibility
INSERT INTO aspect_ratios (generation_type, name, description, ratio, width, height, is_default)
VALUES 
  ('standard', 'SANA 2K Square', 'NVIDIA SANA 2K Square', 1.0, 2048, 2048, false),
  ('360', 'SANA 2K 21:9', 'NVIDIA SANA 2K Ultra-wide', 2.4, 3072, 1280, false)
ON CONFLICT (name) DO NOTHING;
