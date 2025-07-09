-- Create generations table for storing artwork metadata
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Generation parameters
  dataset TEXT NOT NULL,
  seed INTEGER NOT NULL,
  num_samples INTEGER NOT NULL,
  noise REAL NOT NULL,
  color_scheme TEXT,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('svg', 'ai')),
  
  -- AI-specific fields
  ai_prompt TEXT,
  
  -- Image storage
  cloudinary_public_id TEXT,
  cloudinary_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  image_format TEXT,
  image_bytes INTEGER,
  
  -- Upscaling info
  is_upscaled BOOLEAN DEFAULT FALSE,
  original_generation_id UUID REFERENCES generations(id),
  scale_factor INTEGER,
  upscale_method TEXT,
  
  -- Metadata
  base64_fallback TEXT, -- Store base64 if Cloudinary fails
  generation_time_ms INTEGER,
  
  UNIQUE(dataset, seed, num_samples, noise, color_scheme, generation_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_type ON generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_generations_dataset ON generations(dataset);
CREATE INDEX IF NOT EXISTS idx_generations_upscaled ON generations(is_upscaled);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generations_updated_at 
    BEFORE UPDATE ON generations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
