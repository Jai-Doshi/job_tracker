import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import JobSearch from './pages/JobSearch';
import JobTracker from './pages/JobTracker';
import AIResumeAnalyzer from './pages/AIResumeAnalyzer';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import SplashScreen from './components/SplashScreen';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error("Supabase auth error:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div></div>; // Splash screen covers this
  
  return session ? children : <Navigate to="/auth" />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <>
      <Toaster position="top-right" toastOptions={{
         style: {
           background: '#1e293b',
           color: '#fff',
           border: '1px solid rgba(255,255,255,0.1)',
         }
      }} />
      
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<JobSearch />} />
            <Route path="tracker" element={<JobTracker />} />
            <Route path="ai-analyzer" element={<AIResumeAnalyzer />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
