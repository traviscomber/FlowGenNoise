-- Create a table for storing generated artworks
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  "imageUrl" TEXT NOT NULL,
  "originalPrompt" TEXT,
  dataset TEXT,
  scenario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for the artworks table
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all users to read artworks (public gallery)
CREATE POLICY "Allow public read access" ON artworks
FOR SELECT USING (TRUE);

-- Create a policy to allow authenticated users to insert artworks
CREATE POLICY "Allow authenticated users to insert" ON artworks
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to delete their own artworks
-- (Assuming you'll add a user_id column later if you want per-user galleries)
-- For now, this policy allows any authenticated user to delete any artwork.
-- You might want to refine this to `auth.uid() = user_id` if you add user authentication.
CREATE POLICY "Allow authenticated users to delete" ON artworks
FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: Add a user_id column and update policies for per-user galleries
-- ALTER TABLE artworks ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- CREATE POLICY "Allow users to manage their own artworks" ON artworks
-- FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
