/*
  # Add user information to repair requests

  1. Changes
    - Add user_name and user_email columns to repair_requests table
    - Add indexes for better performance
  2. Security
    - No changes to RLS policies
*/

-- Add new columns to repair_requests if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_requests' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE repair_requests ADD COLUMN user_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_requests' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE repair_requests ADD COLUMN user_email text;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repair_requests_user_name ON repair_requests(user_name);
CREATE INDEX IF NOT EXISTS idx_repair_requests_user_email ON repair_requests(user_email);