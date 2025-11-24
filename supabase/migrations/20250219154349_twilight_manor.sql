/*
  # Create pickup requests table

  1. New Tables
    - `pickup_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `items` (text)
      - `quantity` (integer)
      - `address` (text)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for users to manage their requests
    - Add policies for recyclers to view and update requests
*/

CREATE TABLE IF NOT EXISTS pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  items text NOT NULL,
  quantity integer NOT NULL,
  address text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON pickup_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'recycler'
    )
  );

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON pickup_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY "Users can update own requests"
  ON pickup_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recyclers can update any request
CREATE POLICY "Recyclers can update requests"
  ON pickup_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'recycler'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'recycler'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();