-- Create the gallery table for storing generated artworks
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  upscaled_image_url TEXT,
  generation_params JSONB NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('svg', 'ai')),
  custom_prompt TEXT,
  upscale_method TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_mode ON gallery(mode);
CREATE INDEX IF NOT EXISTS idx_gallery_is_favorite ON gallery(is_favorite);
CREATE INDEX IF NOT EXISTS idx_gallery_tags ON gallery USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_gallery_title ON gallery(title);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later with auth)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'gallery' 
    AND policyname = 'Allow all operations on gallery'
  ) THEN
    CREATE POLICY "Allow all operations on gallery" ON gallery
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
