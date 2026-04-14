import React, { useState } from 'react';
import { Save, Bell, BellOff, MapPin, Briefcase } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="profile-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information and preferences</p>
        </div>
      </header>

      <div className="profile-grid">
        <section className="glass-panel profile-settings">
          <h3>Personal Information</h3>
          
          <div className="profile-avatar-section">
            <div className="avatar-large">A</div>
            <div>
              <button className="btn btn-secondary btn-sm">Change Photo</button>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="input-base" defaultValue="Alex" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="input-base" defaultValue="Smith" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-base" defaultValue="alex.smith@example.com" />
            </div>

            <div className="form-group">
              <label>Professional Title</label>
              <div className="input-with-icon">
                <Briefcase size={18} />
                <input type="text" className="input-base" defaultValue="Frontend Engineer" />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input type="text" className="input-base" defaultValue="San Francisco, CA" />
              </div>
            </div>

            <button className="btn btn-primary save-btn"><Save size={18} /> Save Changes</button>
          </div>
        </section>

        <section className="profile-sidebar">
          <div className="glass-panel preferences-card">
            <h3>Customized Job Filters</h3>
            <p className="pref-description">We use these to auto-filter jobs via the API.</p>
            
            <div className="form-group">
              <label>Target Job Titles (comma separated)</label>
              <input type="text" className="input-base" defaultValue="Frontend Engineer, React Developer" />
            </div>
            <div className="form-group">
              <label>Preferred Work Style</label>
              <select className="input-base">
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
          </div>

          <div className="glass-panel notifications-card">
            <h3>Notifications</h3>
            <div className="notification-toggle">
              <div>
                <h4>Push Notifications</h4>
                <p>Receive updates about application status</p>
              </div>
              <button 
                className={`toggle-btn ${notifications ? 'active' : ''}`}
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? <Bell size={20} /> : <BellOff size={20} />}
                {notifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
