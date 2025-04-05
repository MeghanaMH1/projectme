import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { nhost } from '../lib/nhost';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/nhostAuthStore';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [needsVerification, setNeedsVerification] = React.useState(false);
  const navigate = useNavigate();
  const { user, setUser, setSession } = useAuthStore();

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Proper authentication with nhost
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsVerification(false);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await nhost.auth.signIn({
        email,
        password,
      });
      
      const { error, session } = response;
      
      // Check for verification issues in error message
      if (error && error.message.includes('email verification')) {
        setNeedsVerification(true);
        // Sign out to prevent partial login state
        await nhost.auth.signOut();
        setLoading(false);
        return;
      }

      if (error) {
        throw error;
      }

      if (session) {
        setUser(session.user);
        setSession(session);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('credentials')) {
        setError('Invalid email or password');
      } else if (err.message.includes('email verification')) {
        setNeedsVerification(true);
      } else if (err.message.includes('network')) {
        setError('Network error - please check your connection');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await nhost.auth.sendVerificationEmail({ email });
      
      if (error) {
        throw error;
      }
      
      setNeedsVerification(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <LogIn className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        
        {needsVerification ? (
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md text-center">
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
              Email verification required
            </h3>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              Please check your email and click the verification link to complete your registration.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}