-- Create the gallery table for storing generated artwork
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  upscaled_image_url TEXT,
  svg_content TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('flow', 'ai')),
  dataset TEXT NOT NULL,
  scenario TEXT NOT NULL,
  seed INTEGER NOT NULL,
  num_samples INTEGER,
  noise_scale REAL,
  time_step REAL,
  custom_prompt TEXT,
  upscale_method TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_mode ON gallery(mode);
CREATE INDEX IF NOT EXISTS idx_gallery_dataset ON gallery(dataset);
CREATE INDEX IF NOT EXISTS idx_gallery_scenario ON gallery(scenario);
CREATE INDEX IF NOT EXISTS idx_gallery_is_favorite ON gallery(is_favorite);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_tags ON gallery USING GIN(tags);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for future authentication
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (can be restricted later with auth)
CREATE POLICY IF NOT EXISTS "Allow all operations on gallery" ON gallery
    FOR ALL USING (true) WITH CHECK (true);
