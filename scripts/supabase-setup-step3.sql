-- Step 3: Create RLS policies for 'gallery_images'
-- These policies define who can perform what actions on the 'gallery_images' table.

-- Step 3: Enable Row Level Security (RLS) for the 'gallery' table
-- RLS ensures that users can only access (read, insert, update, delete) their own data.

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access" ON public.gallery_images
FOR SELECT USING (true);

-- Policy for authenticated users to view their own images
CREATE POLICY "Allow authenticated users to view their own images" ON public.gallery_images
FOR SELECT USING (auth.uid() = (metadata->>'user_id')::uuid);

-- Policy for authenticated users to insert their own images
CREATE POLICY "Allow authenticated users to insert their own images" ON public.gallery_images
FOR INSERT WITH CHECK (auth.uid() = (metadata->>'user_id')::uuid);

-- Policy for authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update their own images" ON public.gallery_images
FOR UPDATE USING (auth.uid() = (metadata->>'user_id')::uuid);

-- Policy for authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete their own images" ON public.gallery_images
FOR DELETE USING (auth.uid() = (metadata->>'user_id')::uuid);

-- After enabling RLS, you need to define policies in Step 4.
