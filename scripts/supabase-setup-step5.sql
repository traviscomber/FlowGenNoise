-- Step 5: Set up Supabase Storage Bucket and Policies
-- This creates a storage bucket for your images and defines access rules.

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

-- 5. Create a policy for authenticated users to delete files
-- IMPORTANT: This policy allows authenticated users to delete ANY file in the 'flowsketch-gallery' bucket.
-- In a production application, you would typically want to restrict this to files owned by the user.
-- For example, by linking storage objects to user IDs or gallery table entries.
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (bucket_id = 'flowsketch-gallery' AND auth.role() = 'authenticated');

-- After completing all steps, your Supabase backend should be ready for FlowSketch.
