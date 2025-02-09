-- First create the trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Then create the main function to create the table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create the profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        display_name TEXT,
        phone_number TEXT,
        organization TEXT,
        role TEXT,
        timezone TEXT,
        avatar_url TEXT,
        scan_permission BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add scan_permission column if it doesn't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'scan_permission'
        ) THEN
            ALTER TABLE profiles ADD COLUMN scan_permission BOOLEAN DEFAULT FALSE;
        END IF;
    END $$;

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

    -- Create or replace the trigger
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Set up Row Level Security (RLS)
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

    -- Create policies
    CREATE POLICY "Users can view their own profile"
        ON profiles FOR SELECT
        USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile"
        ON profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
END;
$$;

-- Execute the function to create the table
SELECT create_profiles_table(); 