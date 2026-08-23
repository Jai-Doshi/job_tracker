import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Trash2, X, Edit2, AlertTriangle, Search, ChevronLeft, ChevronRight, Eye, UploadCloud, FileText, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config';
import './JobTracker.css';

interface Application {
  id: number;
  company: string;
  role: string;
  applied_date: string;
  status: string;
  notes: string;
  location?: string;
  match_percentage?: number | string;
  resume_file?: string;
  jd_file?: string;
  timeline?: { status: string; date: string }[];
  created_at?: string;
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

const getMatchColor = (percent: number | string | undefined) => {
  if (percent === undefined || percent === '') return 'transparent';
  const p = Number(percent);
  if (isNaN(p)) return 'transparent';
  if (p >= 90) return '#10B981';
  if (p >= 80) return '#F97316';
  if (p >= 70) return '#4F46E5';
  if (p >= 60) return '#EAB308';
  if (p >= 40) return '#FFFFFF';
  return '#EF4444';
};

const getStatusColor = (status: string) => {
  if (!status) return '#94A3B8';
  const s = status.toLowerCase();
  if (s.includes('applied')) return '#3B82F6';
  if (s.includes('reviewed')) return '#A855F7';
  if (s.includes('interview')) return '#F59E0B';
  if (s.includes('offer')) return '#10B981';
  if (s.includes('rejected')) return '#EF4444';
  return '#94A3B8';
};

interface MobileTrackerCardProps {
  app: Application;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
  getMatchColor: (percent: number | string | undefined) => string;
}

const MobileTrackerCard: React.FC<MobileTrackerCardProps> = ({
  app,
  onView,
  onEdit,
  onDelete,
  formatDate,
  getMatchColor
}) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translation, setTranslation] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    if (!isSwiping) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        setIsSwiping(true);
      }
    }

    if (isSwiping) {
      const maxDrag = 120;
      let targetTranslate = diffX;
      if (Math.abs(diffX) > maxDrag) {
        const overDrag = Math.abs(diffX) - maxDrag;
        targetTranslate = (diffX > 0 ? maxDrag : -maxDrag) + (diffX > 0 ? 1 : -1) * (overDrag * 0.2);
      }
      setTranslation(targetTranslate);
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping) {
      const threshold = 70;
      if (translation > threshold) {
        onDelete();
      } else if (translation < -threshold) {
        onEdit();
      }
    } else {
      onView();
    }
    setTranslation(0);
    setIsSwiping(false);
  };

  const renderSwipeBackground = () => {
    if (translation > 0) {
      return (
        <div className="swipe-bg swipe-bg-delete">
          <Trash2 size={18} />
          <span>Delete</span>
        </div>

      );
    } else if (translation < 0) {
      return (
        <div className="swipe-bg swipe-bg-edit">
          <span>Edit</span>
          <Edit2 size={18} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mobile-card-wrapper">
      {renderSwipeBackground()}
      <div
        className="tracker-mobile-card glass-panel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translation}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          cursor: 'pointer'
        }}
      >
        <div className="card-top-row" style={{ margin: 0 }}>
          <div className="card-brand-section">
            <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="42" height="42" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="21" cy="21" r="19" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <circle
                  cx="21" cy="21" r="19"
                  fill="none"
                  stroke={getMatchColor(app.match_percentage)}
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 19}
                  strokeDashoffset={2 * Math.PI * 19 * (1 - (Number(app.match_percentage || 0) / 100))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="mini-logo" style={{ margin: 0, width: '32px', height: '32px', borderRadius: '50%', zIndex: 1 }}>
                {app.company.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="card-titles">
              <h4 className="card-role">{app.role}</h4>
              <span className="card-company">{app.company}</span>
            </div>
          </div>
          <span
            className={`badge badge-${app.status
              .toLowerCase()
              .replace('interviewing', 'interview')}`}
          >
            {app.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const JobTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ company: '', role: '', notes: '', status: 'Applied', match_percentage: '', resume_file: '', jd_file: '', location: '' });

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Details state
  const [viewTarget, setViewTarget] = useState<Application | null>(null);

  // Search and Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const openCreateModal = () => {
    setCurrentStep(1);
    setEditingId(null);
    setFormData({ company: '', role: '', notes: '', status: 'Applied', match_percentage: '', resume_file: '', jd_file: '', location: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (app: Application) => {
    setCurrentStep(1);
    setEditingId(app.id);
    setFormData({
      company: app.company,
      role: app.role,
      notes: app.notes,
      status: app.status,
      match_percentage: app.match_percentage?.toString() || '',
      resume_file: app.resume_file || '',
      jd_file: app.jd_file || '',
      location: app.location || ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'resume_file' | 'jd_file') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
      const res = await fetch(`${API_BASE_URL}/api/tracker/`, { headers });
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
    app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving application...');
    try {
      const headers = await getAuthHeaders();
      let payload: any = { ...formData };

      if (editingId) {
        const existingApp = applications.find(a => a.id === editingId);
        if (existingApp && existingApp.status !== formData.status) {
          const currentTimeline = existingApp.timeline || [{ status: existingApp.status, date: existingApp.created_at || new Date().toISOString() }];
          payload.timeline = [...currentTimeline, { status: formData.status, date: new Date().toISOString() }];
        } else {
          payload.timeline = existingApp?.timeline || [{ status: formData.status, date: existingApp?.created_at || new Date().toISOString() }];
        }

        const res = await fetch(`${API_BASE_URL}/api/tracker/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
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
        payload.timeline = [{ status: formData.status, date: new Date().toISOString() }];
        const res = await fetch(`${API_BASE_URL}/api/tracker/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
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
      const res = await fetch(`${API_BASE_URL}/api/tracker/${deleteTarget.id}`, {
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

          <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); setCurrentStep(2); } : handleSave} className="modal-form">
            {currentStep === 1 ? (
              <>
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

                <div className="modal-form-row">
                  <div className="input-group">
                    <label htmlFor="location">Location</label>
                    <input
                      id="location"
                      type="text"
                      className="input-base"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Remote, Austin, TX..."
                    />
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
                      <option value="Reviewed">🟣 Reviewed</option>
                      <option value="Interviewing">🟡 Interviewing</option>
                      <option value="Offer">🟢 Offer Received</option>
                      <option value="Rejected">🔴 Rejected</option>
                    </select>
                  </div>
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
                    Next: Upload Docs
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>Upload Resume (PDF/Docs) - Optional</label>
                  <div className="upload-zone">
                    <input
                      id="resume_file"
                      type="file"
                      className="hidden-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'resume_file')}
                    />
                    <label htmlFor="resume_file" className={`upload-label ${formData.resume_file ? 'has-file' : ''}`}>
                      {formData.resume_file ? <FileText size={24} className="file-icon" /> : <UploadCloud size={24} className="upload-icon" />}
                      &nbsp;&nbsp;
                      <span className="upload-text">
                        {formData.resume_file ? 'Resume Uploaded (Click to change)' : 'Click to upload Resume'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="input-group">
                  <label>Upload Job Description (PDF/Docs) - Optional</label>
                  <div className="upload-zone">
                    <input
                      id="jd_file"
                      type="file"
                      className="hidden-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'jd_file')}
                    />
                    <label htmlFor="jd_file" className={`upload-label ${formData.jd_file ? 'has-file' : ''}`}>
                      {formData.jd_file ? <FileText size={24} className="file-icon" /> : <UploadCloud size={24} className="upload-icon" />}
                      &nbsp;&nbsp;
                      <span className="upload-text">
                        {formData.jd_file ? 'JD Uploaded (Click to change)' : 'Click to upload Job Description'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="input-group" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="match_percentage">Match Percentage (%)</label>
                    <input
                      id="match_percentage"
                      type="number"
                      min="0"
                      max="100"
                      className="input-base"
                      value={formData.match_percentage}
                      onChange={(e) => setFormData({ ...formData, match_percentage: e.target.value })}
                      placeholder="e.g. 85"
                    />
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => toast('Analyze functionality coming soon!', { icon: '🔮' })}>
                    Analyze
                  </button>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                    Back
                  </button>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Update Application' : 'Save Application'}
                    </button>
                  </div>
                </div>
              </>
            )}
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
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="table-company-cell">
                          <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="42" height="42" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                              <circle cx="21" cy="21" r="19" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                              <circle
                                cx="21" cy="21" r="19"
                                fill="none"
                                stroke={getMatchColor(app.match_percentage)}
                                strokeWidth="2"
                                strokeDasharray={2 * Math.PI * 19}
                                strokeDashoffset={2 * Math.PI * 19 * (1 - (Number(app.match_percentage || 0) / 100))}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="mini-logo" style={{ margin: 0, width: '32px', height: '32px', borderRadius: '50%', zIndex: 1 }}>
                              {app.company.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="table-role">{app.role}</div>
                            <div className="table-company">
                              {app.company}
                            </div>
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
                      <td className="table-notes" title={app.location}>{truncateText(app.location, 30)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => setViewTarget(app)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
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

              {/* Mobile Card List (styled in JobTracker.css to display only on smaller screens) */}
              <div className="tracker-mobile-list">
                {paginatedApplications.map((app) => (
                  <MobileTrackerCard
                    key={app.id}
                    app={app}
                    onView={() => setViewTarget(app)}
                    onEdit={() => openEditModal(app)}
                    onDelete={() => setDeleteTarget(app)}
                    formatDate={formatDate}
                    getMatchColor={getMatchColor}
                  />
                ))}
              </div>

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

      {/* ── View Details Modal ─────────────────────────────────────────── */}
      {viewTarget && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon">
                  <Eye size={18} />
                </div>
                <h2>Application Details</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setViewTarget(null)} title="Close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{viewTarget.role}</div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {viewTarget.company}
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}><MapPin size={12} color='var(--accent)' />{viewTarget.location}</p>
                  </div>
                </div>
                <div>
                  <span className={`badge badge-${viewTarget.status.toLowerCase().replace('interviewing', 'interview')}`}>
                    {viewTarget.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Date Applied</div>
                  <div>{formatDate(viewTarget.applied_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Match Percentage</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getMatchColor(viewTarget.match_percentage) }}></div>
                    <span>{viewTarget.match_percentage ? `${viewTarget.match_percentage}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Notes</div>
                <div className='notes-display' style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', minHeight: '60px', color: 'var(--text-main)' }}>
                  {viewTarget.notes || 'No notes provided.'}
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Timeline</div>
                <div className="timeline-container">
                  {viewTarget.timeline && viewTarget.timeline.length > 0 ? (
                    viewTarget.timeline.map((event, idx) => {
                      const color = getStatusColor(event.status);
                      return (
                        <div key={idx} className="timeline-item">
                          <div className="timeline-left">
                            <div className="timeline-dot-outer" style={{
                              backgroundColor: `${color}15`,
                              borderColor: `${color}40`
                            }}>
                              <div className="timeline-dot-inner" style={{ backgroundColor: color }} />
                            </div>
                            {idx < viewTarget.timeline.length - 1 && (
                              <div className="timeline-line" />
                            )}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-status">{event.status}</div>
                            <div className="timeline-date">Updated on {formatDate(event.date)}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No timeline data available.</div>
                  )}
                </div>
              </div>

              {(viewTarget.resume_file || viewTarget.jd_file) && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Attached Documents</div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {viewTarget.resume_file && (
                      <a href={viewTarget.resume_file} download="Resume" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        Download Resume
                      </a>
                    )}
                    {viewTarget.jd_file && (
                      <a href={viewTarget.jd_file} download="Job_Description" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        Download JD
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setViewTarget(null)}>
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default JobTracker;
