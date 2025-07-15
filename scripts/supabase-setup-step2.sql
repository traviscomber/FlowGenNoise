-- Step 2: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS Policies for gallery_images
-- RLS is crucial for securing your data. By default, no one can access the table after enabling RLS.
-- You will need to create policies in subsequent steps to grant access.

CREATE POLICY "Users can view own images" ON public.gallery_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON public.gallery_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON public.gallery_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON public.gallery_images
    FOR DELETE USING (auth.uid() = user_id);

-- Step 2: Create the 'gallery' table
-- This table will store metadata about the generated art images.
-- Each entry will link to a user and contain details about the art.

CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase Auth users
    image_url TEXT NOT NULL, -- Public URL of the image in Supabase Storage
    metadata JSONB NOT NULL, -- Stores FlowArtSettings and other generation metadata
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- After running this, proceed to Step 3.
