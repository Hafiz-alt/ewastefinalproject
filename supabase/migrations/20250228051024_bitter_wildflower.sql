/*
  # Fix product policies for marketplace

  1. Changes
    - Update product policies to allow all authenticated users to create products
    - Remove role restriction for product creation
    - Ensure proper RLS for product management
  
  2. Security
    - Maintain seller_id validation to ensure users can only create products as themselves
    - Keep existing policies for viewing and updating products
*/

-- Drop the existing policy that restricts product creation to recyclers and technicians
DROP POLICY IF EXISTS "Users can create products" ON products;

-- Create a new policy that allows any authenticated user to create products
CREATE POLICY "Any authenticated user can create products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());