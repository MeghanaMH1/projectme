import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/nhostAuthStore';
import { nhost } from './lib/nhost';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NewsPreferences from './pages/NewsPreferences';
import SavedArticles from './pages/SavedArticles';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { setUser, setSession } = useAuthStore();
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        // Force sign out to clear any lingering sessions
        await nhost.auth.signOut();
        
        // Get fresh session state
        const currentSession = nhost.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Set up auth state listener for changes
        const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
          console.log("Auth state changed:", event, !!session);
          setSession(session);
          setUser(session?.user ?? null);
        });

        setInitializing(false);

        return () => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error("Error in Nhost authentication:", error);
        setSession(null);
        setUser(null);
        setInitializing(false);
      }
    };

    initAuth();
  }, [setUser, setSession]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="preferences" element={<NewsPreferences />} />
          <Route path="saved" element={<SavedArticles />} />
          <Route path="article/:articleId" element={<ArticleDetail />} />
          <Route path="create-article" element={<CreateArticle />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;