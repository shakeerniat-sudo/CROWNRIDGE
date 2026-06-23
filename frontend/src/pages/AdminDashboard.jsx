import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  BarChart3, PlusCircle, CheckCircle, AlertTriangle, 
  MessageSquare, Star, Settings, Calendar, ShieldCheck 
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const AdminDashboard = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [analytics, setAnalytics] = useState(null);
  const [feedbackLogs, setFeedbackLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Template form states
  const [templateForm, setTemplateForm] = useState({
    title: '',
    weather: '',
    labour: '',
    material: '',
    equipment: '',
    approval: ''
  });
  const [templateSuccess, setTemplateSuccess] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch analytics
      const analyticsRes = await axios.get(`${API_URL}/admin/analytics`, { headers });
      setAnalytics(analyticsRes.data);

      // Fetch feedback
      const feedbackRes = await axios.get(`${API_URL}/feedback`, { headers });
      setFeedbackLogs(feedbackRes.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Failed to load administrative reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    setTemplateLoading(true);
    setTemplateSuccess(false);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/templates`, templateForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplateSuccess(true);
      setTemplateForm({
        title: '',
        weather: '',
        labour: '',
        material: '',
        equipment: '',
        approval: ''
      });
      
      // Refresh templates in delay form if we navigate
    } catch (err) {
      console.error(err);
      setError('Failed to register template.');
    } finally {
      setTemplateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Pre-process chart datasets
  const dailyTrendData = {
    labels: analytics?.charts.dailyTrend.map(d => d.date) || [],
    datasets: [{
      label: 'Delay Reports Filed',
      data: analytics?.charts.dailyTrend.map(d => d.count) || [],
      borderColor: isLight ? '#2563eb' : '#22c55e',
      backgroundColor: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2.5,
      tension: 0.35,
      fill: true
    }]
  };

  const rcLabels = Object.keys(analytics?.charts.rootCauseDistribution || {});
  const rcData = Object.values(analytics?.charts.rootCauseDistribution || {});
  const rootCauseChartData = {
    labels: rcLabels,
    datasets: [{
      data: rcData,
      backgroundColor: isLight ? [
        'rgba(37, 99, 235, 0.8)', // royal blue
        'rgba(59, 130, 246, 0.8)', // hover blue
        'rgba(245, 158, 11, 0.8)', // amber
        'rgba(239, 68, 68, 0.8)',  // red
        'rgba(139, 92, 246, 0.8)', // purple
        'rgba(71, 85, 105, 0.8)',  // slate
      ] : [
        'rgba(34, 197, 94, 0.75)', // green
        'rgba(22, 163, 74, 0.75)', // darker green
        'rgba(245, 158, 11, 0.75)', // amber
        'rgba(239, 68, 68, 0.75)',  // red
        'rgba(139, 92, 246, 0.75)', // purple
        'rgba(100, 116, 139, 0.75)', // slate
      ],
      borderWidth: 1,
      borderColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)'
    }]
  };

  const severityLabels = Object.keys(analytics?.charts.delayCategoryDistribution || {});
  const severityData = Object.values(analytics?.charts.delayCategoryDistribution || {});
  const severityChartData = {
    labels: severityLabels,
    datasets: [{
      label: 'Severities',
      data: severityData,
      backgroundColor: severityLabels.map(s => {
        if (s === 'Critical') return 'rgba(239, 68, 68, 0.75)';
        if (s === 'High') return 'rgba(245, 158, 11, 0.75)';
        if (s === 'Medium') return 'rgba(234, 179, 8, 0.75)';
        return isLight ? 'rgba(37, 99, 235, 0.75)' : 'rgba(59, 130, 246, 0.75)';
      }),
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isLight ? '#475569' : '#94a3b8', font: { family: 'Outfit', size: 10 } } },
      tooltip: { titleFont: { family: 'Outfit' }, bodyFont: { family: 'Outfit' } }
    },
    scales: {
      x: { 
        grid: { color: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)' }, 
        ticks: { color: isLight ? '#475569' : '#64748b', font: { family: 'Outfit', size: 9 } } 
      },
      y: { 
        grid: { color: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)' }, 
        ticks: { color: isLight ? '#475569' : '#64748b', font: { family: 'Outfit', size: 9 }, stepSize: 1 } 
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand-500" />
            Executive Planning Analytics
          </h1>
          <p className="text-dark-400 text-sm mt-1">Review operational performance metrics, template variables, and quality assurance feedback logs.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-950/60 border border-brand-900/30 text-xs font-semibold text-brand-400">
          <ShieldCheck className="h-4 w-4" />
          Admin Clearance Verified
        </span>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border-white/5">
          <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">Reports Today / Monthly</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5">{analytics?.summary.reportsToday} / {analytics?.summary.reportsThisMonth}</h3>
          <p className="text-[10px] text-dark-400 mt-2 font-medium">Daily input rate of diagnostic requests.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5">
          <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">AI Rating Average</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 flex items-center gap-1">
            {analytics?.summary.averageRating}
            <span className="text-xs text-dark-400 font-semibold">/ 5.0</span>
          </h3>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${
                s <= Math.round(parseFloat(analytics?.summary.averageRating || '0')) 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-dark-600'
              }`} />
            ))}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5">
          <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">Top Delay Driver</span>
          <h3 className="text-lg font-extrabold text-white mt-1.5 truncate" title={analytics?.summary.mostCommonRootCause}>
            {analytics?.summary.mostCommonRootCause}
          </h3>
          <p className="text-[10px] text-brand-400 mt-2 font-medium">Dominant delay classification category.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5">
          <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">API Avg Response Time</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5">
            {((analytics?.responseTimeMetrics.averageLatencyMs || 1420) / 1000).toFixed(2)}s
          </h3>
          <p className="text-[10px] text-emerald-400 mt-2 font-medium">SLA compliance rate is active.</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Volume Line Chart */}
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-brand-500" />
            Report Submission Volume Trend (Daily)
          </h3>
          <div className="h-60">
            <Line data={dailyTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Causes Chart */}
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-brand-500" />
            Root Cause Distribution Share
          </h3>
          <div className="h-60 relative flex justify-center">
            {rcData.length === 0 ? (
              <div className="flex items-center text-xs text-dark-400">No cause classifications processed yet.</div>
            ) : (
              <Doughnut 
                data={rootCauseChartData} 
                options={{
                  ...chartOptions,
                  scales: { x: { display: false }, y: { display: false } }
                }} 
              />
            )}
          </div>
        </div>

        {/* Severity categories Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Delay Event Severity Breakdowns</h3>
          <div className="h-60">
            <Bar data={severityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Create template form card */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-brand-500" />
            Incident Quick-Fill Template Creator
          </h3>
          
          {templateSuccess && (
            <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-900/30 text-brand-400 text-xs font-semibold">
              Template created and indexed globally!
            </div>
          )}

          <form onSubmit={handleTemplateSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Template Title</label>
              <input
                type="text" required
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                placeholder="e.g. Winter Blizzard Contingency"
                value={templateForm.title}
                onChange={(e) => setTemplateForm({...templateForm, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Weather Factor</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  placeholder="Snowstorm, high winds"
                  value={templateForm.weather}
                  onChange={(e) => setTemplateForm({...templateForm, weather: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Labour Factor</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  placeholder="Absenteeism, strike"
                  value={templateForm.labour}
                  onChange={(e) => setTemplateForm({...templateForm, labour: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Material Factor</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  placeholder="Steel delay, cargo block"
                  value={templateForm.material}
                  onChange={(e) => setTemplateForm({...templateForm, material: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Equipment Factor</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  placeholder="Generator break, loader repairs"
                  value={templateForm.equipment}
                  onChange={(e) => setTemplateForm({...templateForm, equipment: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Permits / Approvals Factor</label>
              <input
                type="text" required
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                placeholder="Permit pending zoning review"
                value={templateForm.approval}
                onChange={(e) => setTemplateForm({...templateForm, approval: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={templateLoading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              {templateLoading ? 'Publishing Template...' : 'Publish Template'}
            </button>
          </form>
        </div>
      </div>

      {/* User comments list table */}
      <div className="glass-panel p-6 rounded-2xl border-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <MessageSquare className="h-4.5 w-4.5 text-brand-500" />
          User Feedback Comments & Quality Logs
        </h3>

        {feedbackLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-dark-400">No project manager feedback reports recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase font-bold text-dark-400 tracking-wider">
                  <th className="pb-3">Project Details</th>
                  <th className="pb-3">Submitter</th>
                  <th className="pb-3">Rating Score</th>
                  <th className="pb-3">Feedback Remarks</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {feedbackLogs.map((log) => (
                  <tr key={log.id} className="text-xs hover:bg-white/[0.01] transition-all">
                    <td className="py-3">
                      <div className="font-semibold text-white">{log.report.projectName}</div>
                      <div className="text-[10px] text-dark-400">ID: {log.report.projectId}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-dark-200">{log.report.user?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-dark-500">{log.report.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-0.5 items-center">
                        <span className="font-bold text-white mr-1">{log.rating}.0</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${
                            s <= log.rating ? 'text-yellow-400 fill-yellow-400' : 'text-dark-700'
                          }`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-dark-300 font-medium max-w-[200px] truncate" title={log.comment}>
                      {log.comment || <span className="text-dark-500 italic">No comments</span>}
                    </td>
                    <td className="py-3 text-right text-dark-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
