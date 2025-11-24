/*
  # Add user information to pickup requests

  1. Changes
    - Add user_name and user_email columns to pickup_requests table
    - Add indexes for better query performance
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pickup_requests' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE pickup_requests ADD COLUMN user_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pickup_requests' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE pickup_requests ADD COLUMN user_email text;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pickup_requests_user_email ON pickup_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);