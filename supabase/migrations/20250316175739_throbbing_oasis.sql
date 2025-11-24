/*
  # Create Admin User

  1. Changes
    - Create admin user in auth.users
    - Create admin profile in profiles table
    - Set appropriate role and permissions
  
  2. Security
    - Password is hashed using Supabase auth
    - Admin role is properly set
*/

-- Create admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ad0c4cd7-6d39-4a34-8b1e-4e1a68d0c0e7',
  'authenticated',
  'authenticated',
  'admin@ewaste-manager.com',
  -- Password: Admin@123!
  crypt('Admin@123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create admin profile
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  email,
  created_at,
  updated_at
) VALUES (
  'ad0c4cd7-6d39-4a34-8b1e-4e1a68d0c0e7',
  'System Administrator',
  'admin',
  'admin@ewaste-manager.com',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;