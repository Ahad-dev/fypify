-- UUID Migration Script
-- This script migrates the users table from BIGSERIAL (Long) to UUID

-- Step 1: Drop existing table (WARNING: This will delete all data!)
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table with UUID primary key
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);

-- Step 4: Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Notes:
-- - All existing users will be deleted
-- - UUID will be auto-generated using gen_random_uuid()
-- - DatabaseInitializationService will recreate default users on startup
-- - Each user will get a new UUID identifier
