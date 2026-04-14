import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import './JobSearch.css';

const JobSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ query: searchTerm });
      if (location) qs.append('location', location);

      const res = await fetch(`http://127.0.0.1:5000/api/jobs/search?${qs.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.results);
      }
    } catch (err) {
      console.error("Failed to fetch jobs from backend", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch immediately on load if there's a default keyword
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="job-search animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Find Jobs</h1>
          <p className="page-subtitle">Discover and apply to your next opportunity</p>
        </div>
      </header>

      <section className="glass-panel search-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search className="input-icon" size={20} />
            <input
              type="text"
              className="input-base search-input"
              placeholder="Job title, keywords, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="search-input-wrapper location-wrapper">
            <MapPin className="input-icon" size={20} />
            <input
              type="text"
              className="input-base search-input"
              placeholder="City, state, or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button className="btn btn-primary search-btn" onClick={fetchJobs} disabled={loading}>
            {loading ? "Searching..." : "Find Jobs"}
          </button>
        </div>

        <div className="filter-options">
          <button className="btn btn-secondary filter-btn"><Filter size={16} /> Filters</button>
          <div className="quick-filters">
            <span className="badge">Remote</span>
            <span className="badge">Full-time</span>
            <span className="badge">Engineering</span>
          </div>
        </div>
      </section>

      <section className="jobs-list">
        <h2>{jobs.length} Jobs Found across Networks</h2>
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job.id} className="glass-panel job-card">
              <div className="job-card-header">
                <div className="company-logo">{job.company.charAt(0).toUpperCase()}</div>
                <div className="job-title-group">
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company} &bull; <i>via {job.platform}</i></p>
                </div>
              </div>
              <div className="job-tags">
                <span className="job-tag"><MapPin size={14} /> {job.location}</span>
                <span className="job-tag"><Briefcase size={14} /> {job.type || 'Full-time'}</span>
                <span className="job-tag amount">{job.salary}</span>
              </div>
              <div className="job-card-footer">
                <a href={job.apply_url || "#"} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Apply Now</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JobSearch;
