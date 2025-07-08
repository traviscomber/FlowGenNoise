-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS execute_sql(TEXT);
DROP FUNCTION IF EXISTS get_table_columns(TEXT);
DROP FUNCTION IF EXISTS check_index_exists(TEXT);
DROP FUNCTION IF EXISTS check_rls_enabled(TEXT);

-- Create execute_sql function for dynamic SQL execution
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_text TEXT := 'Success';
BEGIN
    -- Execute the provided SQL
    EXECUTE query_text;
    
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Create function to get table column information
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
    WHERE c.table_schema = 'public'
    AND c.table_name = tbl_name
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
        SELECT 1 FROM pg_indexes 
        WHERE indexname = idx_name
    ) INTO index_exists;
    
    RETURN index_exists;
END;
$$;

-- Create function to check if RLS is enabled
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
    WHERE pg_namespace.nspname = 'public'
    AND pg_class.relname = tbl_name;
    
    RETURN COALESCE(rls_enabled, FALSE);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_index_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_enabled(TEXT) TO authenticated;

-- Grant execute permissions to anon users for read-only functions
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_index_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_rls_enabled(TEXT) TO anon;

-- Create essential indexes for performance
DO $$
BEGIN
    -- Check if artworks table exists before creating indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artworks') THEN
        -- Create index on created_at if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'artworks' AND indexname = 'idx_artworks_created_at') THEN
            CREATE INDEX idx_artworks_created_at ON artworks (created_at);
        END IF;
        
        -- Create index on price if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'artworks' AND indexname = 'idx_artworks_price') THEN
            CREATE INDEX idx_artworks_price ON artworks (price);
        END IF;
    END IF;

    -- Check if purchases table exists before creating indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchases') THEN
        -- Create index on user_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'purchases' AND indexname = 'idx_purchases_user_id') THEN
            CREATE INDEX idx_purchases_user_id ON purchases (user_id);
        END IF;
        
        -- Create index on artwork_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'purchases' AND indexname = 'idx_purchases_artwork_id') THEN
            CREATE INDEX idx_purchases_artwork_id ON purchases (artwork_id);
        END IF;
    END IF;
END $$;

-- Enable RLS on critical tables if they exist
DO $$
BEGIN
    -- Enable RLS on artworks table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artworks') THEN
        ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "artworks_public_read" ON artworks;
        DROP POLICY IF EXISTS "artworks_authenticated_write" ON artworks;
        
        -- Create read policy for public
        CREATE POLICY "artworks_public_read" ON artworks
            FOR SELECT TO public USING (true);
            
        -- Create write policy for authenticated users
        CREATE POLICY "artworks_authenticated_write" ON artworks
            FOR ALL TO authenticated USING (true);
    END IF;

    -- Enable RLS on users table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "users_public_read" ON users;
        DROP POLICY IF EXISTS "users_authenticated_write" ON users;
        
        -- Create read policy for public
        CREATE POLICY "users_public_read" ON users
            FOR SELECT TO public USING (true);
            
        -- Create write policy for authenticated users
        CREATE POLICY "users_authenticated_write" ON users
            FOR ALL TO authenticated USING (true);
    END IF;

    -- Enable RLS on purchases table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchases') THEN
        ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "purchases_public_read" ON purchases;
        DROP POLICY IF EXISTS "purchases_authenticated_write" ON purchases;
        
        -- Create read policy for public
        CREATE POLICY "purchases_public_read" ON purchases
            FOR SELECT TO public USING (true);
            
        -- Create write policy for authenticated users
        CREATE POLICY "purchases_authenticated_write" ON purchases
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Success message
SELECT 'Database health functions created successfully!' as result;
