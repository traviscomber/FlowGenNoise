-- Create aspect_ratios table to store available aspect ratios for FLUX 1.1 Pro Ultra
CREATE TABLE IF NOT EXISTS public.aspect_ratios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., "Square", "Portrait", "Landscape", "Panoramic"
  ratio DECIMAL(5,3) NOT NULL, -- e.g., 1.000 for 1:1, 0.750 for 3:4, 1.778 for 16:9
  width INTEGER NOT NULL, -- Width for FLUX 1.1 Pro Ultra (max 1440)
  height INTEGER NOT NULL, -- Height for FLUX 1.1 Pro Ultra (max 1440)
  description TEXT, -- e.g., "Perfect for social media posts"
  is_default BOOLEAN DEFAULT FALSE,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('standard', 'dome', '360', 'all')), -- Which generation types support this ratio
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.aspect_ratios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read aspect ratios (public data)
CREATE POLICY "Allow all users to view aspect ratios" ON public.aspect_ratios FOR SELECT USING (true);

-- Insert default aspect ratios for FLUX 1.1 Pro Ultra
INSERT INTO public.aspect_ratios (name, ratio, width, height, description, is_default, generation_type) VALUES
-- Standard generation ratios
('Square', 1.000, 1440, 1440, 'Perfect square format for social media', true, 'standard'),
('Portrait', 0.750, 1080, 1440, 'Vertical format for mobile displays', false, 'standard'),
('Landscape', 1.333, 1440, 1080, 'Horizontal format for desktop displays', false, 'standard'),
('Widescreen', 1.778, 1440, 810, 'Cinematic 16:9 format', false, 'standard'),

-- Dome generation ratios (typically square for fisheye projection)
('Dome Square', 1.000, 1440, 1440, 'Square format for dome fisheye projection', true, 'dome'),
('Dome Portrait', 0.750, 1080, 1440, 'Vertical dome projection', false, 'dome'),

-- 360° generation ratios (equirectangular format)
('360° Panoramic', 2.000, 1440, 720, 'Standard 2:1 equirectangular panorama', true, '360'),
('360° Ultra Wide', 3.000, 1440, 480, 'Ultra-wide 3:1 panoramic format', false, '360'),
('360° Compact', 1.778, 1440, 810, 'Compact 16:9 panoramic format', false, '360'),

-- Universal ratios (work for all generation types)
('Universal Square', 1.000, 1440, 1440, 'Square format for all generation types', false, 'all'),
('Universal Landscape', 1.333, 1440, 1080, 'Landscape format for all generation types', false, 'all');
