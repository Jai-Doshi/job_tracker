import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

interface Application {
  id: number;
  company: string;
  role: string;
  applied_date: string;
  status: string;
  notes: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const res = await fetch('http://127.0.0.1:5000/api/tracker/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setApplications(json.data);
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch {
        toast.error('Could not connect to backend');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived stats
  const total = applications.length;
  const applied = applications.filter((a) => a.status === 'Applied').length;
  const interviewing = applications.filter((a) => a.status === 'Interviewing').length;
  const offers = applications.filter((a) => a.status === 'Offer').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;

  const successRate = total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  const stats = [
    {
      title: 'Total Applied',
      count: total,
      icon: <Briefcase size={22} color="var(--status-applied)" />,
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      title: 'Interviewing',
      count: interviewing,
      icon: <Clock size={22} color="var(--status-interview)" />,
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      title: 'Offers',
      count: offers,
      icon: <CheckCircle size={22} color="var(--status-offer)" />,
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      title: 'Rejected',
      count: rejected,
      icon: <XCircle size={22} color="var(--status-rejected)" />,
      bg: 'rgba(239, 68, 68, 0.12)',
    },
  ];

  const recentApps = applications.slice(0, 5);

  const getBadgeClass = (status: string) => {
    return `badge badge-${status.toLowerCase().replace('interviewing', 'interview')}`;
  };

  return (
    <div className="dashboard animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Track your job search progress in real-time</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tracker')}>
          + Add Application
        </button>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              {loading ? (
                <div className="stat-skeleton" />
              ) : (
                <h3>{stat.count}</h3>
              )}
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Applications */}
        <section className="glass-panel recent-activity">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <button className="btn-link" onClick={() => navigate('/tracker')}>
              <span className='badge badge-primary'>View All →</span>
            </button>
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <Loader2 size={24} className="spin-icon" />
              <p>Loading applications...</p>
            </div>
          ) : recentApps.length === 0 ? (
            <div className="dashboard-empty">
              <Briefcase size={32} className="empty-icon" />
              <p>No applications yet.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/tracker')}>
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {recentApps.map((job) => (
                <div key={job.id} className="activity-item">
                  <div className="activity-company-logo">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-details">
                    <h4>{job.role}</h4>
                    <p>{job.company} &bull; {job.applied_date}</p>
                  </div>
                  <span className={getBadgeClass(job.status)}>{job.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live Insights */}
        <section className="glass-panel ai-summary">
          <div className="section-header">
            <h2>Search Insights</h2>
            <TrendingUp size={18} color="var(--primary)" />
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <Loader2 size={20} className="spin-icon" />
            </div>
          ) : total === 0 ? (
            <div className="insight-card">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Add applications to see insights about your job search.
              </p>
            </div>
          ) : (
            <>
              <div className="insight-card">
                <p>
                  Active pipeline:{' '}
                  <strong>{interviewing + offers}</strong> of{' '}
                  <strong>{total}</strong> apps in progress
                </p>
                <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${successRate}%`, background: 'var(--status-interview)' }}
                  />
                </div>
                <p className="hint">{successRate}% response rate</p>
              </div>

              <div className="insight-card" style={{ marginTop: '1rem' }}>
                <p>
                  Offer conversion: <strong>{offers}</strong> offer
                  {offers !== 1 ? 's' : ''} from{' '}
                  <strong>{total}</strong> applications
                </p>
                <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${offerRate}%` }}
                  />
                </div>
                <p className="hint">{offerRate}% offer rate</p>
              </div>

              {rejected > 0 && (
                <div className="insight-card" style={{ marginTop: '1rem', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    💡 You've received <strong style={{ color: 'var(--text-main)' }}>{rejected}</strong> rejection
                    {rejected !== 1 ? 's' : ''}. Consider tailoring your resume for each role to improve your hit rate.
                  </p>
                </div>
              )}

              {applied > 0 && interviewing === 0 && (
                <div className="insight-card" style={{ marginTop: '1rem', borderColor: 'rgba(245,158,11,0.2)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    ⏳ <strong style={{ color: 'var(--text-main)' }}>{applied}</strong> application
                    {applied !== 1 ? 's are' : ' is'} awaiting a response. Follow up after 1–2 weeks.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
