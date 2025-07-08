-- Create a function to execute dynamic SQL (for auto-fixes)
-- This should be run in Supabase SQL editor with elevated privileges

CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Create helper functions for health checks

CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT, is_nullable TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT
  FROM information_schema.columns c
  WHERE c.table_name = $1
    AND c.table_schema = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION check_index_exists(index_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  index_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = $1 
      AND schemaname = 'public'
  ) INTO index_exists;
  
  RETURN index_exists;
END;
$$;

CREATE OR REPLACE FUNCTION check_rls_enabled(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT c.relrowsecurity
  INTO rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = $1
    AND n.nspname = 'public';
  
  RETURN COALESCE(rls_enabled, false);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_index_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_enabled(TEXT) TO authenticated;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_rarity ON artworks(rarity);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_artwork_views_artwork_id ON artwork_views(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_likes_artwork_id ON artwork_likes(artwork_id);

-- Enable RLS on critical tables (if not already enabled)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for public read access
CREATE POLICY IF NOT EXISTS "Public artworks are viewable by everyone" 
ON artworks FOR SELECT 
USING (status = 'available');

CREATE POLICY IF NOT EXISTS "Public artists are viewable by everyone" 
ON artists FOR SELECT 
USING (true);

-- Note: Add more specific RLS policies based on your security requirements
