CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  svg_content TEXT,
  upscaled_image_url TEXT,
  mode VARCHAR(50) NOT NULL,
  dataset VARCHAR(255) NOT NULL,
  scenario VARCHAR(255) NOT NULL,
  seed INTEGER NOT NULL,
  num_samples INTEGER,
  noise_scale DOUBLE PRECISION,
  time_step DOUBLE PRECISION,
  custom_prompt TEXT,
  upscale_method VARCHAR(255),
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create a policy for anonymous users to read all artworks
CREATE POLICY "Allow public read access" ON gallery FOR SELECT USING (TRUE);

-- Create a policy for authenticated users to insert, update, and delete their own artworks
-- This policy assumes you have an authentication system that populates auth.uid()
-- For a simple public gallery, you might remove the auth.uid() check for inserts/updates
-- or implement a different authorization mechanism.
CREATE POLICY "Allow authenticated users to manage their own artworks" ON gallery
FOR ALL
TO authenticated
USING (auth.uid() = (SELECT id FROM auth.users WHERE id = auth.uid()));
