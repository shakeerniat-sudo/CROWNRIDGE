import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileSpreadsheet, History, BarChart3, LogOut, User as UserIcon } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DelayForm from './pages/DelayForm';
import ReportHistory from './pages/ReportHistory';
import ReportDetails from './pages/ReportDetails';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Navigation items matching roles
const Navigation = ({ user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive(path) 
      ? 'bg-brand-600 text-white shadow-lg shadow-brand-700/20' 
      : 'text-dark-300 hover:text-white hover:bg-dark-800'
  }`;

  return (
    <nav className="glass-panel sticky top-4 z-40 mx-auto max-w-7xl flex items-center justify-between px-6 py-4 rounded-2xl mb-8 border-white/5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="bg-brand-600 p-2 rounded-lg shadow-inner">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-wider text-white">CROWNRIDGE</span>
          <span className="text-[10px] block font-semibold text-brand-400 -mt-1 uppercase tracking-widest">Delay Analyzer</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link to="/analyze" className={linkClass('/analyze')}>
          <FileSpreadsheet className="h-4 w-4" />
          New Analysis
        </Link>
        <Link to="/history" className={linkClass('/history')}>
          <History className="h-4 w-4" />
          Report History
        </Link>
        {user.role === 'Administrator' && (
          <Link to="/admin" className={linkClass('/admin')}>
            <BarChart3 className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-white/5">
          <div className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-semibold text-dark-100">{user.name}</div>
            <div className="text-[9px] text-dark-400 font-medium">{user.role}</div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-900/40 hover:text-red-300 transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
          <div className="text-dark-400 text-sm font-semibold tracking-wider">Loading Crownridge Systems...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen px-4 py-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-between">
        <div className="w-full">
          <Navigation user={user} handleLogout={handleLogout} />
          
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} />

            {/* Protected Core Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/analyze" element={
              <ProtectedRoute>
                <DelayForm />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <ReportHistory />
              </ProtectedRoute>
            } />
            <Route path="/reports/:id" element={
              <ProtectedRoute>
                <ReportDetails />
              </ProtectedRoute>
            } />

            {/* Protected Admin Only Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Fallback redirection */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="text-center text-dark-500 text-xs mt-16 py-6 border-t border-white/5">
          <p>© {new Date().getFullYear()} Crownridge LLP. AI Project Delay Root Cause Analyzer. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
