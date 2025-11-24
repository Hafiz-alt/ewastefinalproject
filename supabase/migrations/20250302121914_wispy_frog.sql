/*
  # Repair Module Update

  1. New Columns
    - Add `device_model` column to repair_requests table
    - Add `preferred_date` column to repair_requests table
    - Add `estimated_completion` column to repair_requests table

  2. Indexes
    - Add index on device_model for better search performance
*/

-- Add new columns to repair_requests if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_requests' AND column_name = 'device_model'
  ) THEN
    ALTER TABLE repair_requests ADD COLUMN device_model text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_requests' AND column_name = 'preferred_date'
  ) THEN
    ALTER TABLE repair_requests ADD COLUMN preferred_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'repair_requests' AND column_name = 'estimated_completion'
  ) THEN
    ALTER TABLE repair_requests ADD COLUMN estimated_completion date;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repair_requests_device_model ON repair_requests(device_model);
CREATE INDEX IF NOT EXISTS idx_repair_requests_preferred_date ON repair_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_repair_requests_estimated_completion ON repair_requests(estimated_completion);