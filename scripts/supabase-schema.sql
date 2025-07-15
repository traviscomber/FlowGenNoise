-- This script defines the database schema for the FlowSketch application.
-- It includes the 'gallery' table for storing metadata about generated art.

-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the 'gallery' table
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth users
    image_url TEXT NOT NULL, -- Public URL of the image in storage
    metadata JSONB NOT NULL, -- Store FlowArtSettings and other metadata as JSONB
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for the 'gallery' table
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'gallery' table:
-- 1. Allow authenticated users to read their own gallery images
CREATE POLICY "Users can view their own gallery images" ON public.gallery
FOR SELECT USING (auth.uid() = user_id);

-- 2. Allow authenticated users to insert gallery images
CREATE POLICY "Users can insert their own gallery images" ON public.gallery
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own gallery images
CREATE POLICY "Users can update their own gallery images" ON public.gallery
FOR UPDATE USING (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own gallery images
CREATE POLICY "Users can delete their own gallery images" ON public.gallery
FOR DELETE USING (auth.uid() = user_id);

-- Create the 'flowsketch-gallery' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowsketch-gallery', 'flowsketch-gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) for the 'flowsketch-gallery' bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'flowsketch-gallery' bucket:
-- 1. Allow public read access to files in the bucket
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'flowsketch-gallery');

-- 2. Allow authenticated users to insert files into the bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'flowsketch-gallery' AND auth.role() = 'authenticated');

-- 3. Allow authenticated users to delete files from the bucket (only if they own them, or if linked to their gallery entry)
-- For simplicity, this policy allows authenticated users to delete any file in the bucket.
-- In a production app, you'd want to link this to the user_id of the image in the 'gallery' table.
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (bucket_id = 'flowsketch-gallery' AND auth.role() = 'authenticated');

-- Optional: Add an index for faster lookups by user_id in the gallery table
CREATE INDEX IF NOT EXISTS idx_gallery_user_id ON public.gallery (user_id);
