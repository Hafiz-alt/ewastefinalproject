/*
  # Points Management Functions

  1. New Functions
    - `increment_points` - Function to safely increment points
    - `add_points` - Stored procedure to add points to a user
    - `deduct_points` - Stored procedure to deduct points from a user
*/

-- Function to safely increment points
CREATE OR REPLACE FUNCTION increment_points(row_id uuid, amount int)
RETURNS int AS $$
DECLARE
  current_points int;
BEGIN
  SELECT points INTO current_points FROM profiles WHERE id = row_id;
  RETURN COALESCE(current_points, 0) + amount;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to add points to a user
CREATE OR REPLACE FUNCTION add_points(user_id uuid, points_to_add int)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to deduct points from a user
CREATE OR REPLACE FUNCTION deduct_points(user_id uuid, points_to_deduct int)
RETURNS void AS $$
DECLARE
  current_points int;
BEGIN
  -- Get current points
  SELECT points INTO current_points FROM profiles WHERE id = user_id;
  
  -- Check if user has enough points
  IF COALESCE(current_points, 0) < points_to_deduct THEN
    RAISE EXCEPTION 'Not enough points';
  END IF;
  
  -- Deduct points
  UPDATE profiles
  SET points = current_points - points_to_deduct
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Add pickups column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'pickups'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pickups integer DEFAULT 0;
  END IF;
END $$;

-- Function to increment pickups count when a pickup is completed
CREATE OR REPLACE FUNCTION increment_pickups()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles
    SET pickups = COALESCE(pickups, 0) + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment pickups
CREATE TRIGGER increment_pickups_trigger
AFTER UPDATE ON pickup_requests
FOR EACH ROW
EXECUTE FUNCTION increment_pickups();