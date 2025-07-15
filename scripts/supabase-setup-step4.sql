-- Step 4: Define RLS Policies for the 'gallery' table
-- These policies control what authenticated users can do with their data.

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

-- After running these policies, proceed to Step 5 for storage setup.
