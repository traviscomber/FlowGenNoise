-- Step 3: Enable Row Level Security (RLS) for 'gallery_images' and define policies
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gallery images." ON public.gallery_images
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gallery images." ON public.gallery_images
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images." ON public.gallery_images
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gallery images." ON public.gallery_images
FOR DELETE USING (auth.uid() = user_id);
