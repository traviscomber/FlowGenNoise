-- Step 4: Create a storage bucket for gallery images and define RLS policies for storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowsketch-gallery', 'flowsketch-gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload their own files." ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to view their own files." ON storage.objects
FOR SELECT USING (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to update their own files." ON storage.objects
FOR UPDATE USING (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to delete their own files." ON storage.objects
FOR DELETE USING (bucket_id = 'flowsketch-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
