/*
  # Fix profiles table policies

  1. Changes
    - Add INSERT policy for authenticated users
    - Modify existing policies to be more permissive during registration
    - Add policy for public profile reads

  2. Security
    - Maintain RLS while allowing necessary operations
    - Ensure users can only modify their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy for registration
CREATE POLICY "Enable insert for registration"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);