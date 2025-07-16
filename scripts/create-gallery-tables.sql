-- Create the gallery_artworks table
CREATE TABLE IF NOT EXISTS gallery_artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  svg_content TEXT,
  upscaled_image_url TEXT,
  mode VARCHAR(10) NOT NULL CHECK (mode IN ('flow', 'ai')),
  dataset VARCHAR(100) NOT NULL,
  scenario VARCHAR(100) NOT NULL,
  seed INTEGER NOT NULL,
  num_samples INTEGER,
  noise_scale DECIMAL(5,4),
  time_step DECIMAL(5,4),
  custom_prompt TEXT,
  upscale_method VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_artworks_mode ON gallery_artworks(mode);
CREATE INDEX IF NOT EXISTS idx_gallery_artworks_dataset ON gallery_artworks(dataset);
CREATE INDEX IF NOT EXISTS idx_gallery_artworks_scenario ON gallery_artworks(scenario);
CREATE INDEX IF NOT EXISTS idx_gallery_artworks_is_favorite ON gallery_artworks(is_favorite);
CREATE INDEX IF NOT EXISTS idx_gallery_artworks_created_at ON gallery_artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_artworks_tags ON gallery_artworks USING GIN(tags);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_gallery_artworks_updated_at ON gallery_artworks;
CREATE TRIGGER update_gallery_artworks_updated_at
  BEFORE UPDATE ON gallery_artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for future user authentication
ALTER TABLE gallery_artworks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (can be restricted later with auth)
CREATE POLICY "Allow all operations on gallery_artworks" ON gallery_artworks
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data to test the table
INSERT INTO gallery_artworks (
  title, 
  description, 
  image_url, 
  mode, 
  dataset, 
  scenario, 
  seed, 
  num_samples, 
  noise_scale, 
  time_step, 
  tags
) VALUES 
(
  'Neural Network Visualization', 
  'A beautiful representation of interconnected neural pathways', 
  '/placeholder.svg?height=512&width=512&text=Neural+Network', 
  'ai', 
  'neural_networks', 
  'cyberpunk', 
  1234, 
  1000, 
  0.05, 
  0.01, 
  ARRAY['neural', 'cyberpunk', 'ai', 'visualization']
),
(
  'DNA Double Helix', 
  'Molecular structure of DNA with genetic sequences', 
  '/placeholder.svg?height=512&width=512&text=DNA+Structure', 
  'ai', 
  'dna_sequences', 
  'bioluminescent', 
  5678, 
  1500, 
  0.08, 
  0.02, 
  ARRAY['dna', 'biology', 'molecular', 'bioluminescent']
),
(
  'Quantum Field Dynamics', 
  'Visualization of quantum field interactions and particle physics', 
  '/placeholder.svg?height=512&width=512&text=Quantum+Fields', 
  'ai', 
  'quantum_fields', 
  'holographic', 
  9999, 
  2000, 
  0.12, 
  0.015, 
  ARRAY['quantum', 'physics', 'holographic', 'particles']
);
