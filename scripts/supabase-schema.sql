-- This script defines the schema for your Supabase database.
-- It includes tables for storing gallery images and user profiles.

-- Create the 'gallery_images' table
CREATE TABLE public.gallery_images (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    metadata jsonb, -- Stores generation settings, filename, fileSize, aestheticScore, etc.
    is_favorite boolean DEFAULT FALSE,
    tags text[], -- Array of tags for categorization
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) for 'gallery_images'
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own images
CREATE POLICY "Users can view their own gallery images." ON public.gallery_images
FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own images
CREATE POLICY "Users can insert their own gallery images." ON public.gallery_images
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own images
CREATE POLICY "Users can update their own gallery images." ON public.gallery_images
FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own images
CREATE POLICY "Users can delete their own gallery images." ON public.gallery_images
FOR DELETE USING (auth.uid() = user_id);

-- Create a storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowsketch-gallery', 'flowsketch-gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the storage bucket
-- Policy for users to upload their own images to their folder
CREATE POLICY "Allow authenticated users to upload their own files." ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for users to view their own images
CREATE POLICY "Allow authenticated users to view their own files." ON storage.objects
FOR SELECT USING (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for users to update their own images
CREATE POLICY "Allow authenticated users to update their own files." ON storage.objects
FOR UPDATE USING (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for users to delete their own images
CREATE POLICY "Allow authenticated users to delete their own files." ON storage.objects
FOR DELETE USING (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Optional: Create a 'profiles' table to store additional user information
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    avatar_url text,
    PRIMARY KEY (id)
);

-- Enable RLS for 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can create their own profile." ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Set up a trigger to create a profile for new users
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
