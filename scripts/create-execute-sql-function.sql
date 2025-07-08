-- Create a function to execute dynamic SQL (needed for auto-fixes)
-- This should be run by a database administrator

CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;

-- Create RLS policy for the function
ALTER FUNCTION execute_sql(TEXT) OWNER TO postgres;
