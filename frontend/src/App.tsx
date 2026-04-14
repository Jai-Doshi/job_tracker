import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import JobSearch from './pages/JobSearch';
import JobTracker from './pages/JobTracker';
import AIResumeAnalyzer from './pages/AIResumeAnalyzer';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<JobSearch />} />
          <Route path="tracker" element={<JobTracker />} />
          <Route path="ai-analyzer" element={<AIResumeAnalyzer />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
