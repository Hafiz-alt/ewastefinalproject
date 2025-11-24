/*
  # Create Admin User

  1. Changes
    - Create admin user in auth.users
    - Create admin profile in profiles table
    - Set appropriate role and permissions
  
  2. Security
    - Password is properly hashed using Supabase auth
    - Admin role is properly set
*/

-- First, ensure the auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the admin user using Supabase's auth.users() function
DO $$
DECLARE
  admin_uid UUID := 'ad0c4cd7-6d39-4a34-8b1e-4e1a68d0c0e7';
BEGIN
  -- Only insert if the user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_uid) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@ewaste-manager.com',
      crypt('Admin@123!', gen_salt('bf', 10)), -- Using proper password hashing
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Administrator"}',
      false,
      'authenticated'
    );
  END IF;
END $$;

-- Create admin profile if it doesn't exist
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  email,
  created_at,
  updated_at,
  points,
  pickups
) VALUES (
  'ad0c4cd7-6d39-4a34-8b1e-4e1a68d0c0e7',
  'System Administrator',
  'admin',
  'admin@ewaste-manager.com',
  now(),
  now(),
  0,
  0
) ON CONFLICT (id) DO NOTHING;