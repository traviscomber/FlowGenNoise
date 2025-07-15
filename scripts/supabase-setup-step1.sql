-- Step 1: Enable the uuid-ossp extension
-- This extension is needed for generating UUIDs (Universally Unique Identifiers)
-- which are used for primary keys in our tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can run this command in your Supabase SQL editor.
-- After running, proceed to Step 2.
