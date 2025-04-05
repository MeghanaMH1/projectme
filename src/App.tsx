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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { setUser, setSession } = useAuthStore();

  React.useEffect(() => {

    // Set up auth state listener
    try {
      // Instead of using getSession which may not return a Promise,
      // use a simpler approach to get the current state
      const currentSession = nhost.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Set up auth state listener for changes
      const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error("Error in Nhost authentication:", error);
      setSession(null);
      setUser(null);
    }
  }, [setUser, setSession]);

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;