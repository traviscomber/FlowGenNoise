CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  prompt text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert access" ON public.gallery_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
