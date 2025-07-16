-- Create the gallery table for storing artwork
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  upscaled_image_url TEXT,
  svg_content TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('flow', 'ai')),
  dataset TEXT NOT NULL,
  scenario TEXT,
  seed INTEGER NOT NULL,
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

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (for future authentication)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (update when adding auth)
CREATE POLICY "Allow all operations on gallery" ON gallery
  FOR ALL USING (true);
