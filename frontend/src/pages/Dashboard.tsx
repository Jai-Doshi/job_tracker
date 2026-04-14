import React from 'react';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  // Mock Data
  const stats = [
    { title: 'Total Applied', count: 42, icon: <Briefcase color="var(--status-applied)" />, bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Interviewing', count: 5, icon: <Clock color="var(--status-interview)" />, bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Offers', count: 1, icon: <CheckCircle color="var(--status-offer)" />, bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Rejected', count: 12, icon: <XCircle color="var(--status-rejected)" />, bg: 'rgba(239, 68, 68, 0.1)' },
  ];

  const recentJobs = [
    { id: 1, company: 'Google', role: 'Frontend Engineer', date: '2026-04-12', status: 'Applied' },
    { id: 2, company: 'Meta', role: 'React Developer', date: '2026-04-10', status: 'Interviewing' },
    { id: 3, company: 'Netflix', role: 'UI Engineer', date: '2026-04-05', status: 'Rejected' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Track your job search progress</p>
        </div>
        <button className="btn btn-primary">+ Add Application</button>
      </header>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.count}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <section className="glass-panel recent-activity">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <button className="btn-link">View All</button>
          </div>
          
          <div className="activity-list">
            {recentJobs.map(job => (
              <div key={job.id} className="activity-item">
                <div className="activity-company-logo">
                  {job.company.charAt(0)}
                </div>
                <div className="activity-details">
                  <h4>{job.role}</h4>
                  <p>{job.company} &bull; {job.date}</p>
                </div>
                <div className={`badge badge-${job.status.toLowerCase()}`}>
                  {job.status}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="glass-panel ai-summary">
          <div className="section-header">
            <h2>AI Insights</h2>
          </div>
          <div className="insight-card">
            <p>Your resume matches <strong>78%</strong> of your target roles.</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '78%' }}></div>
            </div>
            <p className="hint">Try adding keywords like "TypeScript" and "GraphQL" to improve matches.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
