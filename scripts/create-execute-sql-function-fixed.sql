-- Create a function to execute dynamic SQL (for auto-fixes)
-- Fixed version without parameter name conflicts

CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query_text;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Create helper functions for health checks
CREATE OR REPLACE FUNCTION get_table_columns(tbl_name TEXT)
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
  WHERE c.table_name = tbl_name
    AND c.table_schema = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION check_index_exists(idx_name TEXT)
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
    WHERE indexname = idx_name 
      AND schemaname = 'public'
  ) INTO index_exists;
  
  RETURN index_exists;
END;
$$;

CREATE OR REPLACE FUNCTION check_rls_enabled(tbl_name TEXT)
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
  WHERE c.relname = tbl_name
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

-- Test the functions
SELECT 'Database functions created successfully!' as status;
