/*
  # Chat System Tables

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `admin_email` (text)
      - `title` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references chat_rooms)
      - `sender_id` (uuid)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user and admin access
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  admin_email text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chat rooms policies
CREATE POLICY "chat_rooms_select_policy"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_admin(auth.jwt() ->> 'email')
  );

CREATE POLICY "chat_rooms_insert_policy"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_rooms_update_policy"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_admin(auth.jwt() ->> 'email')
  );

-- Chat messages policies
CREATE POLICY "chat_messages_select_policy"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.user_id = auth.uid() OR
        is_admin(auth.jwt() ->> 'email')
      )
    )
  );

CREATE POLICY "chat_messages_insert_policy"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.user_id = auth.uid() OR
        is_admin(auth.jwt() ->> 'email')
      )
    )
  );

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(room_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE chat_messages
  SET read = true
  WHERE room_id = room_id_param
  AND sender_id != auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();