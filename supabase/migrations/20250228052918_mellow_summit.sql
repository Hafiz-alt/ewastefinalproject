/*
  # Create repair requests system

  1. New Tables
    - `repair_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `technician_id` (uuid, references profiles, nullable)
      - `device_type` (text)
      - `issue_description` (text)
      - `status` (text)
      - `estimated_cost` (numeric, nullable)
      - `address` (text)
      - `images` (jsonb)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `repair_updates`
      - `id` (uuid, primary key)
      - `repair_id` (uuid, references repair_requests)
      - `author_id` (uuid, references profiles)
      - `message` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on both tables
    - Add policies for users and technicians
*/

-- Create repair_requests table
CREATE TABLE IF NOT EXISTS repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  technician_id uuid REFERENCES profiles(id),
  device_type text NOT NULL,
  issue_description text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'assigned', 'diagnosing', 'repairing', 'completed', 'cancelled')),
  estimated_cost numeric,
  address text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create repair_updates table for communication
CREATE TABLE IF NOT EXISTS repair_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id uuid REFERENCES repair_requests(id) NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_updates ENABLE ROW LEVEL SECURITY;

-- Policies for repair_requests

-- Users can view their own requests
CREATE POLICY "Users can view own repair requests"
  ON repair_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    technician_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'technician'
    )
  );

-- Users can create repair requests
CREATE POLICY "Users can create repair requests"
  ON repair_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own requests if not assigned
CREATE POLICY "Users can update own repair requests"
  ON repair_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Technicians can update any request assigned to them
CREATE POLICY "Technicians can update assigned repair requests"
  ON repair_requests
  FOR UPDATE
  TO authenticated
  USING (
    technician_id = auth.uid() OR
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'technician'
      ) AND status = 'pending'
    )
  )
  WITH CHECK (
    technician_id = auth.uid() OR
    (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'technician'
      ) AND status = 'pending'
    )
  );

-- Policies for repair_updates

-- Users can view updates for their own repairs
CREATE POLICY "Users can view updates for their repairs"
  ON repair_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repair_requests
      WHERE repair_requests.id = repair_id
      AND (repair_requests.user_id = auth.uid() OR repair_requests.technician_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'technician'
    )
  );

-- Users and technicians can create updates for their repairs
CREATE POLICY "Users and technicians can create updates"
  ON repair_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM repair_requests
      WHERE repair_requests.id = repair_id
      AND (repair_requests.user_id = auth.uid() OR repair_requests.technician_id = auth.uid())
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER set_repair_requests_updated_at
  BEFORE UPDATE ON repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repair_requests_user_id ON repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_technician_id ON repair_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_updates_repair_id ON repair_updates(repair_id);