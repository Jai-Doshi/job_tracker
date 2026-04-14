import React, { useState, useEffect, useRef } from 'react';
import { Save, Bell, BellOff, MapPin, Briefcase, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Profile.css';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  location: string;
  target_roles: string;
  work_style: string;
  push_notifications: boolean;
  avatar_url: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    title: '',
    location: '',
    target_roles: '',
    work_style: 'Remote',
    push_notifications: true,
    avatar_url: ''
  });

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.session?.access_token}`
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const headers = await getAuthHeaders();
        const res = await fetch('http://127.0.0.1:5000/api/profile/', { headers });
        const resData = await res.json();

        if (resData.success) {
          setProfile({
            ...resData.data,
            email: user?.email || resData.data.email || ''
          });
        }
      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleToggleNotifications = () => {
    setProfile(prev => ({ ...prev, push_notifications: !prev.push_notifications }));
  };

  const handleSave = async () => {
    const loadingId = toast.loading("Saving profile...");
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('http://127.0.0.1:5000/api/profile/', {
        method: 'PUT',
        headers,
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile saved successfully!", { id: loadingId });
      } else {
        toast.error(data.error || "Failed to save profile", { id: loadingId });
      }
    } catch (err) {
      toast.error("Network error while saving", { id: loadingId });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate('/auth');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading avatar...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      toast.success("Avatar uploaded! Remember to click Save Changes.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Error uploading image", { id: toastId });
    }
  };

  if (loading) return <div className="profile-page animate-fade-in"><div style={{ padding: '2rem' }}>Loading profile...</div></div>;

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
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="avatar-large" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar-large">{profile.first_name + profile.last_name ? profile.first_name.charAt(0).toUpperCase() + profile.last_name.charAt(0).toUpperCase() : 'CA'}</div>
            )}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                Change Photo
              </button>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" className="input-base" value={profile.first_name} onChange={handleChange} placeholder="First Name" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" className="input-base" value={profile.last_name} onChange={handleChange} placeholder="Last Name" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input-base" value={profile.email} onChange={handleChange} disabled style={{ opacity: 0.7 }} />
            </div>

            <div className="form-group">
              <label>Professional Title</label>
              <div className="input-with-icon">
                <Briefcase size={18} />
                <input type="text" name="title" className="input-base" value={profile.title} onChange={handleChange} placeholder="Frontend Engineer" />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input type="text" name="location" className="input-base" value={profile.location} onChange={handleChange} placeholder="San Francisco, CA" />
              </div>
            </div>

            <button className="btn btn-primary save-btn" onClick={handleSave}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </section>

        <section className="profile-sidebar">
          <div className="glass-panel preferences-card">
            <h3>Customized Job Filters</h3>
            <p className="pref-description">We use these to auto-filter jobs via the API.</p>

            <div className="form-group">
              <label>Target Job Titles (comma separated)</label>
              <input type="text" name="target_roles" className="input-base" value={profile.target_roles} onChange={handleChange} placeholder="Frontend Engineer, React Developer" />
            </div>
            <br></br>
            <div className="form-group">
              <label>Preferred Work Style</label>
              <select name="work_style" className="input-base" value={profile.work_style} onChange={handleChange}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
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
                className={`toggle-btn ${profile.push_notifications ? 'active' : ''}`}
                onClick={handleToggleNotifications}
              >
                {profile.push_notifications ? <Bell size={20} /> : <BellOff size={20} />}
                {profile.push_notifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleLogout}
              className="btn"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', width: '100%', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
