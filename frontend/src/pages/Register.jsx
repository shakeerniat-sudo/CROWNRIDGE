import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, KeyRound, Mail, User as UserIcon, Briefcase, AlertCircle } from 'lucide-react';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); // Default to Standard User
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role
      });
      const { token, user } = response.data;

      // Save token and credentials
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration submit error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-10 border-white/5 relative overflow-hidden">
        {/* Glowing Top Ambient Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400"></div>

        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-600 p-3 rounded-2xl shadow-xl shadow-brand-700/25 mb-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans text-center">Join Crownridge</h2>
          <p className="text-dark-400 text-xs mt-1 text-center font-medium">CREATE AN ANALYSIS WORKSTATION PROFILE</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                <UserIcon className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Corporate Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                placeholder="j.doe@crownridge.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">System Access Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                <Briefcase className="h-4.5 w-4.5" />
              </span>
              <select
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="User">Project Manager / Engineer (User)</option>
                <option value="Administrator">Planning Executive (Administrator)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:text-dark-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-700/15 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-950 cursor-pointer"
          >
            {loading ? 'Creating Workstation Profile...' : 'Complete Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-dark-400">Already registered? </span>
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-all underline decoration-brand-600 underline-offset-4">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
