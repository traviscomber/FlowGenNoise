-- Enable Row Level Security (RLS) for all tables
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_schemes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is art generation data)
CREATE POLICY "Allow public read access on datasets" ON datasets
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on scenarios" ON scenarios
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on color_schemes" ON color_schemes
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update (if needed for admin features)
CREATE POLICY "Allow authenticated insert on datasets" ON datasets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on color_schemes" ON color_schemes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
