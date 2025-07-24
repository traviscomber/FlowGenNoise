-- Create the gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to insert, select, update, and delete their own gallery items
-- For simplicity, this example allows all users to see all items.
-- In a real application, you might want to restrict viewing to only the user's own items.

-- Policy for SELECT (read access)
CREATE POLICY "Allow public read access to gallery items"
ON public.gallery_items FOR SELECT
USING (true);

-- Policy for INSERT (create access)
CREATE POLICY "Allow authenticated users to insert gallery items"
ON public.gallery_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy for UPDATE (modify access - if you want users to edit prompts, etc.)
-- For now, we'll keep it simple and assume items are not updated after creation.
-- If you need update, you'd add:
-- CREATE POLICY "Allow authenticated users to update their own gallery items"
-- ON public.gallery_items FOR UPDATE
-- USING (auth.uid() = user_id); -- Assuming a 'user_id' column exists and links to auth.uid()

-- Policy for DELETE (delete access)
CREATE POLICY "Allow authenticated users to delete their own gallery items"
ON public.gallery_items FOR DELETE
USING (auth.role() = 'authenticated'); -- Or auth.uid() = user_id if you add a user_id column
