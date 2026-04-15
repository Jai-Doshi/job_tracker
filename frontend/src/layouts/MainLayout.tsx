import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, Briefcase, BrainCircuit, User, LogOut, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import './MainLayout.css';

interface ProfileData {
  first_name: string;
  last_name: string;
  title: string;
  avatar_url: string;
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Find Jobs', path: '/search', icon: <Search size={20} /> },
    { name: 'Tracker', path: '/tracker', icon: <Briefcase size={20} /> },
    { name: 'AI Analyzer', path: '/ai-analyzer', icon: <BrainCircuit size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  useEffect(() => {
    const fetchMiniProfile = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session?.access_token) return;

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session?.access_token}`
        };

        const res = await fetch('http://127.0.0.1:5000/api/profile/', { headers });
        const resData = await res.json();

        if (resData.success) {
          setProfile(resData.data);
        }
      } catch (err) {
        console.error("Failed to load mini profile", err);
      }
    };
    fetchMiniProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully logged out");
    navigate('/auth');
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return `${(profile.first_name || 'C').charAt(0).toUpperCase()}${(profile.last_name || 'A').charAt(0).toUpperCase()}`;
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <nav className="glass-panel sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <img src="/favicon.png" alt="App Icon" />
          </div>
          <h2>CareerArc</h2>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.path === '/ai-analyzer' && (
                  <Crown
                    size={16}
                    style={{
                      marginLeft: 'auto',
                      color: '#f59e0b',
                      filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))',
                      flexShrink: 0,
                    }}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-mini-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar" style={{ minWidth: '36px' }}>{getInitials()}</div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <p className="user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Loading...'}
                </p>
                <p className="user-role" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '12px' }}>
                  {profile?.title || 'No Title'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)', // Red color with 10% opacity
                border: 'none',
                color: '#ef4444',                    // Matches the red icon color
                cursor: 'pointer',
                padding: '0.6rem',                   // Increased padding for a better circle shape
                borderRadius: '50%',                 // Makes it perfectly circular
                display: 'flex',                     // Centers the icon inside the circle
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'        // Smooth hover effect
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
