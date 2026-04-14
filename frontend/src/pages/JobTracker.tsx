import React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import './JobTracker.css';

const JobTracker: React.FC = () => {
  const applications = [
    { id: 1, company: 'Google', role: 'Frontend Engineer', appliedDate: '2026-04-12', status: 'Applied', notes: 'Referred by Sarah' },
    { id: 2, company: 'Meta', role: 'React Developer', appliedDate: '2026-04-10', status: 'Interviewing', notes: 'First round done' },
    { id: 3, company: 'Stripe', role: 'UI Engineer', appliedDate: '2026-04-01', status: 'Offer', notes: 'Negotiating salary' },
    { id: 4, company: 'Netflix', role: 'Senior UX UI', appliedDate: '2026-04-05', status: 'Rejected', notes: 'Lack of native app exp' },
    { id: 5, company: 'Vercel', role: 'Design Engineer', appliedDate: '2026-04-14', status: 'Applied', notes: 'Cold applied' },
  ];

  return (
    <div className="job-tracker animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-subtitle">Manage your active applications</p>
        </div>
        <button className="btn btn-primary"><Plus size={18} /> New Entry</button>
      </header>

      <div className="glass-panel tracker-container">
        <table className="tracker-table">
          <thead>
            <tr>
              <th>Company & Role</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>
                  <div className="table-company-cell">
                    <div className="mini-logo">{app.company.charAt(0)}</div>
                    <div>
                      <div className="table-role">{app.role}</div>
                      <div className="table-company">{app.company}</div>
                    </div>
                  </div>
                </td>
                <td className="table-date">{app.appliedDate}</td>
                <td>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                </td>
                <td className="table-notes">{app.notes}</td>
                <td>
                  <button className="btn-icon"><MoreHorizontal size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobTracker;
