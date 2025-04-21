/*
  # Create admin users table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `organization` (text)
      - `contact` (text)
      - `email` (text)
      - `location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for authenticated users to read admin data
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial admin user
INSERT INTO admin_users (name, organization, contact, email, location)
VALUES (
  'EcoScan Admin',
  'EcoScan UAE',
  '+971 50 123 4567',
  'admin@ecoscan.ae',
  'Dubai, United Arab Emirates'
);