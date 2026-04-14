import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Search, Briefcase, BrainCircuit, User } from 'lucide-react';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Find Jobs', path: '/search', icon: <Search size={20} /> },
    { name: 'Tracker', path: '/tracker', icon: <Briefcase size={20} /> },
    { name: 'AI Analyzer', path: '/ai-analyzer', icon: <BrainCircuit size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

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
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="avatar">A</div>
            <div>
              <p className="user-name">Alex Smith</p>
              <p className="user-role">Frontend Eng</p>
            </div>
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
