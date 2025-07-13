-- Step 2: Create the 'gallery_images' table
CREATE TABLE public.gallery_images (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    metadata jsonb, -- Stores generation settings, filename, fileSize, aestheticScore, etc.
    is_favorite boolean DEFAULT FALSE,
    tags text[], -- Array of tags for categorization
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS Policies for gallery_images
CREATE POLICY "Users can view own images" ON gallery_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON gallery_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON gallery_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON gallery_images
    FOR DELETE USING (auth.uid() = user_id);
