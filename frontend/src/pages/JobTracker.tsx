import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import './JobTracker.css';

interface Application {
  id: number;
  company: string;
  role: string;
  applied_date: string;
  status: string;
  notes: string;
}

const JobTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ company: '', role: '', notes: '', status: 'Applied' });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ company: '', role: '', notes: '', status: 'Applied' });
    setIsModalOpen(true);
  };

  const openEditModal = (app: Application) => {
    setEditingId(app.id);
    setFormData({ company: app.company, role: app.role, notes: app.notes, status: app.status });
    setIsModalOpen(true);
  };

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.session?.access_token}`
    };
  };

  const fetchApplications = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('http://127.0.0.1:5000/api/tracker/', { headers });
      const data = await res.json();
      if (data.success) setApplications(data.data);
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving application...");
    try {
      const headers = await getAuthHeaders();

      if (editingId) {
        const res = await fetch(`http://127.0.0.1:5000/api/tracker/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setApplications(applications.map(app => app.id === editingId ? data.data : app));
          setIsModalOpen(false);
          toast.success("Application updated!", { id: loadingToast });
        } else {
          toast.error(data.error || "Failed to update application", { id: loadingToast });
        }
      } else {
        const res = await fetch('http://127.0.0.1:5000/api/tracker/', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setApplications([data.data, ...applications]);
          setIsModalOpen(false);
          toast.success("Application saved!", { id: loadingToast });
        } else {
          toast.error(data.error || "Failed to create application", { id: loadingToast });
        }
      }
    } catch (err) {
      toast.error("Failed to communicate with DB.", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://127.0.0.1:5000/api/tracker/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.filter(app => app.id !== id));
        toast.success("Application deleted");
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };



  return (
    <div className="job-tracker animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-subtitle">Manage your active applications via Supabase</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> New Entry
        </button>
      </header>

      <div className="glass-panel tracker-container">
        {loading ? (
          <div className="empty-state"><p>Loading tracking data...</p></div>
        ) : applications.length === 0 ? (
          <div className="empty-state"><p>You haven't tracked any applications yet.</p></div>
        ) : (
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
                      <div className="mini-logo">{app.company.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="table-role">{app.role}</div>
                        <div className="table-company">{app.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-date">{app.applied_date}</td>
                  <td>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                  </td>
                  <td className="table-notes">{app.notes}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => openEditModal(app)} title="Edit Application">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete-btn" onClick={() => handleDelete(app.id)} title="Delete Application">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Application Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Application' : 'Add New Application'}</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="input-group">
                <label>Company Name</label>
                <input required type="text" className="input-base" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Acme Corp" />
              </div>
              <div className="input-group">
                <label>Role</label>
                <input required type="text" className="input-base" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Senior Developer" />
              </div>
              <div className="input-group">
                <label>Initial Status</label>
                <select className="input-base" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="input-group">
                <label>Notes (Optional)</label>
                <textarea className="input-base textarea" rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Referred by someone, quick thoughts..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
