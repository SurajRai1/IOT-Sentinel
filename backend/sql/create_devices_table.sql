-- First create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Then create the main function to create the table
CREATE OR REPLACE FUNCTION create_devices_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    column_exists boolean;
BEGIN
    -- Create the devices table if it doesn't exist
    CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        ip TEXT NOT NULL,
        mac TEXT,
        name TEXT,
        type TEXT,
        manufacturer TEXT,
        model TEXT,
        status TEXT,
        security_score INTEGER,
        last_seen TIMESTAMP WITH TIME ZONE,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Check if user_id column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'devices' 
        AND column_name = 'user_id'
    ) INTO column_exists;

    -- Add user_id column if it doesn't exist
    IF NOT column_exists THEN
        ALTER TABLE devices ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_devices_ip ON devices(ip);
    CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac);
    CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
    CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
    CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);
    CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

    -- Create or replace the trigger
    DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
    CREATE TRIGGER update_devices_updated_at
        BEFORE UPDATE ON devices
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security
    ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own devices" ON devices;
    DROP POLICY IF EXISTS "Users can insert their own devices" ON devices;
    DROP POLICY IF EXISTS "Users can update their own devices" ON devices;
    DROP POLICY IF EXISTS "Users can delete their own devices" ON devices;
    DROP POLICY IF EXISTS "Service role can manage all devices" ON devices;

    -- Create policies
    CREATE POLICY "Users can view their own devices"
        ON devices FOR SELECT
        USING (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Users can insert their own devices"
        ON devices FOR INSERT
        WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Users can update their own devices"
        ON devices FOR UPDATE
        USING (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Users can delete their own devices"
        ON devices FOR DELETE
        USING (auth.uid() = user_id);

    -- Allow service role full access
    CREATE POLICY "Service role can manage all devices"
        ON devices
        USING (auth.role() = 'service_role');
END;
$$;

-- Execute the function to create the table
SELECT create_devices_table(); 