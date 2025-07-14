-- This script sets up the full Supabase schema and storage for the FlowSketch app.
-- It includes creating the storage bucket, enabling RLS, and defining the 'gallery' table.

-- 1. Create the 'flowsketch-gallery' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowsketch-gallery', 'flowsketch-gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Row Level Security (RLS) for the 'flowsketch-gallery' bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy for anonymous users to read files (public access)
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'flowsketch-gallery');

-- 4. Create a policy for authenticated users to insert files
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'flowsketch-gallery' AND auth.role() = 'authenticated');

-- 5. Create a policy for authenticated users to update their own files (optional, if you want to allow updates)
-- This policy assumes you might store user_id in metadata or have a way to link objects to users.
-- For simplicity, we'll omit this for now, as the app primarily uploads new images.

-- 6. Create a policy for authenticated users to delete their own files
-- This policy assumes you might store user_id in metadata or have a way to link objects to users.
-- For simplicity, we'll allow authenticated users to delete any file in the bucket for now,
-- but in a real app, you'd want to restrict this to files owned by the user.
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (bucket_id = 'flowsketch-gallery' AND auth.role() = 'authenticated');

-- 7. Create the 'gallery' table to store image metadata
-- This table will store structured data about each image, linking to the storage objects.
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth users
    image_url TEXT NOT NULL, -- Public URL of the image in storage
    metadata JSONB NOT NULL, -- Store FlowArtSettings and other metadata as JSONB
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS) for the 'gallery' table
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for the 'gallery' table

-- Policy for authenticated users to read their own gallery images
CREATE POLICY "Users can view their own gallery images" ON public.gallery
FOR SELECT USING (auth.uid() = user_id);

-- Policy for authenticated users to insert gallery images
CREATE POLICY "Users can insert their own gallery images" ON public.gallery
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own gallery images
CREATE POLICY "Users can update their own gallery images" ON public.gallery
FOR UPDATE USING (auth.uid() = user_id);

-- Policy for authenticated users to delete their own gallery images
CREATE POLICY "Users can delete their own gallery images" ON public.gallery
FOR DELETE USING (auth.uid() = user_id);

-- Optional: Add an index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_gallery_user_id ON public.gallery (user_id);

-- Optional: Add a function to generate UUIDs if not already available
-- This is usually available by default in Supabase, but good to ensure.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
