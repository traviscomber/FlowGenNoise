-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS execute_sql(TEXT);
DROP FUNCTION IF EXISTS get_table_columns(TEXT);
DROP FUNCTION IF EXISTS check_index_exists(TEXT);
DROP FUNCTION IF EXISTS check_rls_enabled(TEXT);

-- Create function to execute dynamic SQL safely
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_text TEXT := '';
BEGIN
    -- Execute the SQL and capture any result
    EXECUTE query_text;
    result_text := 'SQL executed successfully';
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Create function to get table column information
CREATE OR REPLACE FUNCTION get_table_columns(tbl_name TEXT)
RETURNS TABLE(
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    column_default TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.column_default::TEXT
    FROM information_schema.columns c
    WHERE c.table_name = tbl_name
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$;

-- Create function to check if index exists
CREATE OR REPLACE FUNCTION check_index_exists(idx_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    index_exists BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = idx_name 
        AND schemaname = 'public'
    ) INTO index_exists;
    
    RETURN index_exists;
END;
$$;

-- Create function to check if RLS is enabled on a table
CREATE OR REPLACE FUNCTION check_rls_enabled(tbl_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rls_enabled BOOLEAN := FALSE;
BEGIN
    SELECT pg_class.relrowsecurity
    INTO rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE pg_class.relname = tbl_name
    AND pg_namespace.nspname = 'public';
    
    RETURN COALESCE(rls_enabled, FALSE);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_index_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_enabled(TEXT) TO authenticated;

-- Create essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_address ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable RLS on critical tables
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for public read access
CREATE POLICY IF NOT EXISTS "Public artworks are viewable by everyone" 
ON artworks FOR SELECT 
USING (status = 'available');

CREATE POLICY IF NOT EXISTS "Transactions are viewable by everyone" 
ON transactions FOR SELECT 
USING (true);
