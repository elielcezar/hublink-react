import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PageEditor from './pages/PageEditor';
import PublicPage from './pages/PublicPage';
import NotFound from './pages/NotFound';
import PageAnalytics from './pages/PageAnalytics';
import SettingsAnalytics from './pages/SettingsAnalytics';
import AccountSettings from './pages/AccountSettings';
import './App.css';

function App() {
  return (
    <Router>      
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:pageId" element={<PageEditor />} />
          <Route path="/analytics/:id" element={<PageAnalytics />} />
          <Route path="/settings/analytics" element={<SettingsAnalytics />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="/:slug" element={<PublicPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>      
    </Router>
  );
}

export default App;
