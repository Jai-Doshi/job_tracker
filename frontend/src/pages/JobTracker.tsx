import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Trash2, X, Edit2, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const datePart = dateStr.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return `${d}-${m}-${y}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const truncateText = (text: string, maxLength: number = 30) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '......' : text;
};

const JobTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ company: '', role: '', notes: '', status: 'Applied' });

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
      'Authorization': `Bearer ${data.session?.access_token}`,
    };
  };

  const fetchApplications = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('http://127.0.0.1:5000/api/tracker/', { headers });
      const data = await res.json();
      if (data.success) setApplications(data.data);
    } catch {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredApplications = applications.filter(app =>
    app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving application...');
    try {
      const headers = await getAuthHeaders();

      if (editingId) {
        const res = await fetch(`http://127.0.0.1:5000/api/tracker/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setApplications(applications.map((app) => (app.id === editingId ? data.data : app)));
          setIsModalOpen(false);
          toast.success('Application updated!', { id: loadingToast });
        } else {
          toast.error(data.error || 'Failed to update application', { id: loadingToast });
        }
      } else {
        const res = await fetch('http://127.0.0.1:5000/api/tracker/', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setApplications([data.data, ...applications]);
          setIsModalOpen(false);
          toast.success('Application saved!', { id: loadingToast });
        } else {
          toast.error(data.error || 'Failed to create application', { id: loadingToast });
        }
      }
    } catch {
      toast.error('Failed to communicate with DB.', { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://127.0.0.1:5000/api/tracker/${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.filter((app) => app.id !== deleteTarget.id));
        toast.success('Application deleted');
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch {
      toast.error('Delete failed');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Add / Edit Modal ──────────────────────────────────────────────
  const formModal = isModalOpen
    ? ReactDOM.createPortal(
      <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-left">
              <div className="modal-icon">
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              </div>
              <h2>{editingId ? 'Edit Application' : 'Add New Application'}</h2>
            </div>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} title="Close">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="modal-form">
            <div className="modal-form-row">
              <div className="input-group">
                <label htmlFor="company">Company Name</label>
                <input
                  id="company"
                  required
                  type="text"
                  className="input-base"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google, Tesla..."
                />
              </div>
              <div className="input-group">
                <label htmlFor="role">Role / Position</label>
                <input
                  id="role"
                  required
                  type="text"
                  className="input-base"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Developer"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="status">Application Status</label>
              <select
                id="status"
                className="input-base"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Applied">🔵 Applied</option>
                <option value="Interviewing">🟡 Interviewing</option>
                <option value="Offer">🟢 Offer Received</option>
                <option value="Rejected">🔴 Rejected</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                className="input-base textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Recruiter name, referral, key details..."
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Application' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )
    : null;

  // ── Delete Confirmation Modal ─────────────────────────────────────
  const deleteModal = deleteTarget
    ? ReactDOM.createPortal(
      <div className="modal-overlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
        <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
          {/* Warning icon */}
          <div className="confirm-icon-wrap">
            <div className="confirm-icon">
              <AlertTriangle size={28} />
            </div>
          </div>

          <h2 className="confirm-title">Delete Application?</h2>
          <p className="confirm-body">
            You're about to permanently delete your application for{' '}
            <strong>{deleteTarget.role}</strong> at{' '}
            <strong>{deleteTarget.company}</strong>. This cannot be undone.
          </p>

          <div className="confirm-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Keep It
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <div className="job-tracker animate-fade-in">
        <header className="page-header">
          <div>
            <h1 className="page-title">Application Tracker</h1>
            <p className="page-subtitle">Manage your active applications via Supabase</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base search-input"
              />
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> New Entry
            </button>
          </div>
        </header>

        <div className="glass-panel tracker-container">
          {loading ? (
            <div className="empty-state">
              <p>Loading tracking data...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications match your search.</p>
            </div>
          ) : (
            <>
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th>Company &amp; Role</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((app) => (
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
                      <td className="table-date">{formatDate(app.applied_date)}</td>
                      <td>
                        <span
                          className={`badge badge-${app.status
                            .toLowerCase()
                            .replace('interviewing', 'interview')}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="table-notes" title={app.notes}>{truncateText(app.notes, 30)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => openEditModal(app)}
                            title="Edit Application"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon delete-btn"
                            onClick={() => setDeleteTarget(app)}
                            title="Delete Application"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn-icon"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {formModal}
      {deleteModal}
    </>
  );
};

export default JobTracker;
