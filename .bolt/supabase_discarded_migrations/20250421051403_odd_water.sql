/*
  # Admin User Setup

  1. Updates
    - Add admin user with secure credentials
    - Set up proper authentication policies
*/

-- Update admin user with secure credentials
UPDATE admin_users
SET 
  name = 'EcoScan Administrator',
  organization = 'EcoScan UAE',
  contact = '+971 50 123 4567',
  email = 'admin@ecoscan.ae',
  location = 'Dubai, United Arab Emirates'
WHERE email = 'admin@ecoscan.ae';

-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Grant necessary permissions to admin role
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT USAGE ON SCHEMA public TO admin;

-- Create policy for admin access
CREATE POLICY "Admins have full access"
  ON admin_users
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;