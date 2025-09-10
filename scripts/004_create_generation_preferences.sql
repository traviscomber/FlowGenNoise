-- Create generation preferences table to store user's selective generation choices
CREATE TABLE IF NOT EXISTS generation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  generate_standard BOOLEAN DEFAULT true,
  generate_dome BOOLEAN DEFAULT true,
  generate_360 BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE generation_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CRUD operations
CREATE POLICY "Allow users to view their own generation preferences" 
  ON generation_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own generation preferences" 
  ON generation_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own generation preferences" 
  ON generation_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own generation preferences" 
  ON generation_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_generation_preferences_updated_at 
  BEFORE UPDATE ON generation_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
