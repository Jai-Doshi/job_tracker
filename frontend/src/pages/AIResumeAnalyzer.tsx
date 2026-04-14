import React, { useState } from 'react';
import { UploadCloud, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import './AIResumeAnalyzer.css';

const AIResumeAnalyzer: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | any>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [resumeText, setResumeText] = useState('');

  const handleAnalyze = async () => {
    if (!jobDesc || !resumeText) {
      alert("Please provide both a Job Description and a Resume.");
      return;
    }

    setAnalyzing(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDesc
        })
      });

      const data = await response.json();
      if (data.success && data.results) {
        setResult(data.results);
      } else {
        alert(data.error || "Failed to analyze resume.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Network error connecting to AI API.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="ai-analyzer animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">AI Resume Analyzer</h1>
          <p className="page-subtitle">Match your resume against any Job Description</p>
        </div>
      </header>

      <div className="analyzer-grid">
        <div className="input-section glass-panel">
          <h3>Input Data</h3>
          
          <div className="input-group">
            <label>Job Description</label>
            <textarea 
              className="input-base textarea" 
              placeholder="Paste the job description here..."
              rows={6}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            ></textarea>
          </div>

          <div className="input-group">
            <label>Resume (Text or Upload)</label>
            <div className="upload-area">
              <UploadCloud size={32} color="var(--primary)" />
              <p>Drag & drop your PDF resume here or paste text below</p>
              <button className="btn btn-secondary btn-sm">Browse Files</button>
            </div>
            <textarea 
              className="input-base textarea" 
              placeholder="Or paste your resume text here..."
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            ></textarea>
          </div>

          <button 
            className="btn btn-primary analyze-btn" 
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <span className="loading-spinner"></span>
            ) : (
              <><Zap size={18} /> Analyze Match</>
            )}
          </button>
        </div>

        <div className="results-section glass-panel">
          <h3>Analysis Results</h3>
          
          {!result && !analyzing && (
            <div className="empty-state">
              <Zap size={48} opacity={0.2} />
              <p>Paste your JD and resume to see how well they match.</p>
            </div>
          )}

          {analyzing && (
            <div className="empty-state analyzing">
              <div className="pulsing-circle"></div>
              <p>AI is analyzing your resume against the job description...</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="results-content animate-fade-in">
              <div className="match-score">
                <div className="score-circle">
                  <span>{result.matchPercentage}%</span>
                </div>
                <div className="score-text">
                  <h4>Great Match!</h4>
                  <p>Your profile aligns well, but there's room for optimization.</p>
                </div>
              </div>

              <div className="keywords-grid">
                <div className="keyword-card matches">
                  <h4><CheckCircle size={16} /> Matched Keywords</h4>
                  <div className="chips">
                    {result.matchedKeywords.map((kw: string) => (
                      <span key={kw} className="chip success">{kw}</span>
                    ))}
                  </div>
                </div>

                <div className="keyword-card missing">
                  <h4><AlertCircle size={16} /> Missing Keywords</h4>
                  <div className="chips">
                    {result.missingKeywords.map((kw: string) => (
                      <span key={kw} className="chip warning">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="suggestions-list">
                <h4>AI Suggestions to Improve</h4>
                <ul>
                  {result.suggestions.map((sug: string, idx: number) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResumeAnalyzer;
