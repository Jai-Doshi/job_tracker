import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import './JobSearch.css';

const JobSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  // Mock API Jobs
  const mockJobs = [
    { id: 1, title: 'Senior Frontend Engineer', company: 'TechCorp', location: 'Remote', type: 'Full-time', salary: '$120k - $160k', posted: '2 days ago' },
    { id: 2, title: 'React Developer', company: 'Innovate AI', location: 'New York, NY', type: 'Full-time', salary: '$100k - $130k', posted: '5 hours ago' },
    { id: 3, title: 'UI/UX Designer', company: 'DesignStudio', location: 'San Francisco, CA', type: 'Contract', salary: '$80/hr', posted: '1 day ago' },
    { id: 4, title: 'Full Stack Web Developer', company: 'StartUp Inc.', location: 'Remote', type: 'Full-time', salary: '$110k - $140k', posted: '3 days ago' },
  ];

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="btn btn-primary search-btn">Find Jobs</button>
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
        <h2>{filteredJobs.length} Jobs Found</h2>
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="glass-panel job-card">
              <div className="job-card-header">
                <div className="company-logo">{job.company.charAt(0)}</div>
                <div className="job-title-group">
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                </div>
              </div>
              <div className="job-tags">
                <span className="job-tag"><MapPin size={14}/> {job.location}</span>
                <span className="job-tag"><Briefcase size={14}/> {job.type}</span>
                <span className="job-tag amount">{job.salary}</span>
              </div>
              <div className="job-card-footer">
                <span className="posted-time">{job.posted}</span>
                <button className="btn btn-primary btn-sm">Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JobSearch;
