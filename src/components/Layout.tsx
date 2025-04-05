import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/nhostAuthStore';
import { Sun, Moon, Menu, X, Home, Newspaper, User as UserIcon, LogOut, Settings, Bookmark, PenSquare } from 'lucide-react';

export default function Layout() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, signOut, setUser, setSession } = useAuthStore();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = () => {
    // Directly clear the user and session without waiting for nhost
    setUser(null);
    setSession(null);
    // Navigate to login
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Newspaper className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                    <Home className="inline-block h-5 w-5 mr-1" />
                    Dashboard
                  </Link>
                  <Link to="/preferences" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                    <Settings className="inline-block h-5 w-5 mr-1" />
                    News Preferences
                  </Link>
                  <Link to="/saved" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                    <Bookmark className="inline-block h-5 w-5 mr-1" />
                    Saved Articles
                  </Link>
                  <Link to="/profile" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                    <UserIcon className="inline-block h-5 w-5 mr-1" />
                    Profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link 
                  to="/create-article"
                  className="hidden sm:inline-flex mr-4 items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PenSquare className="h-4 w-4 mr-1" />
                  Write Article
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="ml-4 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                )}
                <div className="sm:hidden">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu, show/hide based on menu state */}
        {menuOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <Home className="inline-block h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/preferences"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="inline-block h-5 w-5 mr-2" />
                News Preferences
              </Link>
              <Link
                to="/saved"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <Bookmark className="inline-block h-5 w-5 mr-2" />
                Saved Articles
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon className="inline-block h-5 w-5 mr-2" />
                Profile
              </Link>
              <Link
                to="/create-article"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <PenSquare className="inline-block h-5 w-5 mr-2" />
                Write Article
              </Link>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}