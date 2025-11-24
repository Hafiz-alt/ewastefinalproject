/*
  # Fix images constraint in products table

  1. Changes
    - Modify the images column in products table to allow NULL values
    - This allows users to create listings without uploading images
  
  2. Security
    - No security changes, just a constraint modification
*/

-- Alter the products table to make the images column nullable
ALTER TABLE products 
ALTER COLUMN images DROP NOT NULL;