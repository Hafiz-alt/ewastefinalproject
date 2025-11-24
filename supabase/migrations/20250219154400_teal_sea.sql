/*
  # Create educational content table

  1. New Tables
    - `educational_content`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `resources` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for educators to create and manage content
    - Add policies for all users to view content
*/

CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  resources jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

-- Everyone can view educational content
CREATE POLICY "Anyone can view educational content"
  ON educational_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Only educators can create content
CREATE POLICY "Educators can create content"
  ON educational_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'educator'
    )
  );

-- Educators can update their own content
CREATE POLICY "Educators can update own content"
  ON educational_content
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'educator'
    )
  )
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'educator'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER set_educational_content_updated_at
  BEFORE UPDATE ON educational_content
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();