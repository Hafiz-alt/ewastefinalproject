/*
  # Rewards System Implementation

  1. New Tables
    - `rewards` - Stores available rewards that users can redeem
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `points_required` (integer)
      - `discount_percentage` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_rewards` - Tracks rewards redeemed by users
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `reward_id` (uuid, references rewards)
      - `redeemed_at` (timestamptz)
      - `code` (text, unique redemption code)
      - `is_used` (boolean)
      - `used_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Updates to Existing Tables
    - Add `points` column to `profiles` table
    
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add points column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'points'
  ) THEN
    ALTER TABLE profiles ADD COLUMN points integer DEFAULT 0;
  END IF;
END $$;

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL CHECK (points_required > 0),
  discount_percentage integer NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  reward_id uuid REFERENCES rewards(id) NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for rewards
CREATE POLICY "Anyone can view active rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create policies for user_rewards
CREATE POLICY "Users can view own rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own rewards"
  ON user_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rewards"
  ON user_rewards
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER set_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_user_rewards_updated_at
  BEFORE UPDATE ON user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert some initial rewards
INSERT INTO rewards (title, description, points_required, discount_percentage)
VALUES 
  ('10% Discount', 'Get 10% off your next marketplace purchase', 100, 10),
  ('25% Discount', 'Get 25% off your next marketplace purchase', 250, 25),
  ('50% Discount', 'Get 50% off your next marketplace purchase', 500, 50),
  ('Free Pickup', 'Get a free e-waste pickup service', 150, 100);