-- Create the gallery table for storing generated artworks
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  upscaled_image_url TEXT,
  generation_params JSONB NOT NULL,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('svg', 'ai')),
  custom_prompt TEXT,
  upscale_method VARCHAR(50),
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);

-- Create an index on mode for filtering
CREATE INDEX IF NOT EXISTS idx_gallery_mode ON gallery(mode);

-- Create an index on is_favorite for filtering favorites
CREATE INDEX IF NOT EXISTS idx_gallery_favorite ON gallery(is_favorite);

-- Create an index on tags for tag-based searches
CREATE INDEX IF NOT EXISTS idx_gallery_tags ON gallery USING GIN(tags);

-- Enable Row Level Security (optional - for multi-user support later)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'gallery' 
    AND policyname = 'Allow all operations on gallery'
  ) THEN
    CREATE POLICY "Allow all operations on gallery" ON gallery
      FOR ALL USING (true);
  END IF;
END $$;
