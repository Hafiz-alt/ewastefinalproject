import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import backgroundImage from '../assets/background.png';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // If user is logged in, we'll still allow registration but provide a logout option
          setCheckingAuth(false);
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Check if user exists first
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email);

      if (queryError) throw queryError;

      if (existingUsers && existingUsers.length > 0) {
        setError('An account with this email already exists');
        setIsLoading(false);
        return;
      }

      // Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Insert profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: formData.name,
            role: formData.role,
            email: formData.email,
          }
        ]);

      if (profileError) throw profileError;

      // Redirect to login page after successful registration
      navigate('/login', {
        state: {
          message: 'Registration successful! Please log in.'
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload(); // Reload the page to clear any cached auth state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay for better text readability if needed, though glass card handles it */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col justify-center items-center mb-6">
          <Link to="/" className="flex justify-center items-center bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-lg border border-white/30 hover:scale-105 transition-transform duration-300">
            <Recycle className="h-14 w-14 text-white drop-shadow-md" />
          </Link>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white drop-shadow-lg">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-50 font-medium drop-shadow">
            Join the e-waste revolution
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/50 relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl"></div>

          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50/90 border border-red-200 rounded-lg shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 appearance-none transition-all duration-200"
                >
                  <option value="user">User</option>
                  <option value="recycler">Recycler</option>
                  <option value="technician">Technician</option>
                  <option value="educator">Educator</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Register'}
              </button>
            </div>
          </form>

          {/* Add a sign out button if user is already logged in */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-red-200 rounded-xl shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Sign out from current session
            </button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 backdrop-blur-sm text-gray-500 rounded-full">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border-2 border-emerald-600 rounded-full shadow-sm text-sm font-bold text-emerald-600 bg-transparent hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
