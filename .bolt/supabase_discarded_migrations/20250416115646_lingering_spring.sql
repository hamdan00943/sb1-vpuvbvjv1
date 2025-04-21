/*
  # Scan History and Device Giveaways Schema

  1. New Tables
    - `scan_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `device_name` (text)
      - `image_url` (text)
      - `result` (jsonb)
      - `created_at` (timestamp)
    
    - `device_giveaways`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `device_name` (text)
      - `description` (text)
      - `condition` (text)
      - `image_url` (text)
      - `location` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create scan_history table
CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  device_name text NOT NULL,
  image_url text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create device_giveaways table
CREATE TABLE IF NOT EXISTS device_giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  device_name text NOT NULL,
  description text,
  condition text NOT NULL,
  image_url text,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_giveaways ENABLE ROW LEVEL SECURITY;

-- Scan history policies
CREATE POLICY "Users can view their own scan history"
  ON scan_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own scan history"
  ON scan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own scan history"
  ON scan_history
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Device giveaways policies
CREATE POLICY "Anyone can view available device giveaways"
  ON device_giveaways
  FOR SELECT
  TO authenticated
  USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own device giveaways"
  ON device_giveaways
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own device giveaways"
  ON device_giveaways
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own device giveaways"
  ON device_giveaways
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_created_at ON scan_history(created_at DESC);
CREATE INDEX idx_device_giveaways_user_id ON device_giveaways(user_id);
CREATE INDEX idx_device_giveaways_status ON device_giveaways(status);
CREATE INDEX idx_device_giveaways_created_at ON device_giveaways(created_at DESC);

-- Create function to get user's scan history
CREATE OR REPLACE FUNCTION get_user_scan_history(limit_param integer DEFAULT 10)
RETURNS SETOF scan_history AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM scan_history
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get available device giveaways
CREATE OR REPLACE FUNCTION get_available_device_giveaways(limit_param integer DEFAULT 10)
RETURNS SETOF device_giveaways AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM device_giveaways
  WHERE status = 'available'
  ORDER BY created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_giveaways_updated_at
  BEFORE UPDATE ON device_giveaways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();