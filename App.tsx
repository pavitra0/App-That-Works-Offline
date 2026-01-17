
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { db } from './db';
import { Report, ReportCategory } from './types';
import { syncManager } from './services/syncManager';
import NetworkIndicator from './components/NetworkIndicator';
import ReportCard from './components/ReportCard';

// Page Components
const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    const allReports = await db.reports.toArray();
    // Sort so newest is on top
    setReports(allReports.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  useEffect(() => {
    loadReports();
    // Listen for online event to trigger auto-sync
    const handleOnline = () => {
      triggerSync();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadReports]);

  const triggerSync = async () => {
    if (isSyncing || !navigator.onLine) return;
    
    setIsSyncing(true);
    setSyncStatus('Initiating sync...');
    
    const result = await syncManager.processSyncQueue((msg) => setSyncStatus(msg));
    
    setSyncStatus(`Sync complete: ${result.success} succeeded, ${result.failed} failed.`);
    await loadReports();
    
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(null);
    }, 3000);
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const syncedReports = reports.filter(r => r.status === 'synced');

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Resilient Dashboard</h1>
          <p className="text-slate-500">Managing {reports.length} total reports</p>
        </div>
        <button 
          onClick={triggerSync}
          disabled={isSyncing || !navigator.onLine}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            isSyncing ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 
            navigator.onLine ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <i className={`fa-solid fa-sync ${isSyncing ? 'animate-spin' : ''}`}></i>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {syncStatus && (
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-sm font-medium animate-pulse">
          {syncStatus}
        </div>
      )}

      <div className="space-y-12">
        {/* Pending Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
            <span className="text-amber-500 text-xl"><i className="fa-solid fa-clock"></i></span>
            <h2 className="text-lg font-bold text-slate-800">Pending Sync ({pendingReports.length})</h2>
          </div>
          {pendingReports.length === 0 ? (
            <p className="text-slate-400 italic text-sm">No pending reports. Everything is up to date.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>

        {/* Synced Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
            <span className="text-green-500 text-xl"><i className="fa-solid fa-circle-check"></i></span>
            <h2 className="text-lg font-bold text-slate-800">Synced Reports ({syncedReports.length})</h2>
          </div>
          {syncedReports.length === 0 ? (
            <p className="text-slate-400 italic text-sm">No synced reports yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syncedReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const CreateReport: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: ReportCategory.EMERGENCY,
    description: '',
    hasImage: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const newReport: Report = {
      ...formData,
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      // 1. Always save to local DB first (Offline-First)
      await db.reports.add(newReport);
      
      // 2. Try to sync immediately if online
      if (navigator.onLine) {
        setFeedback({ type: 'success', msg: 'Report saved locally. Attempting background sync...' });
        // Background sync trigger
        syncManager.processSyncQueue();
      } else {
        setFeedback({ type: 'success', msg: 'Offline mode: Report saved locally. Will sync automatically when internet returns.' });
      }

      setFormData({
        name: '',
        location: '',
        category: ReportCategory.EMERGENCY,
        description: '',
        hasImage: false
      });
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to save report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Create Incident Report</h1>
        <p className="text-slate-500">Provide details about the current situation. Fields will be stored locally even if you lose signal.</p>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
          feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <i className={`mt-1 fa-solid ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          <span className="font-medium text-sm">{feedback.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
          <input 
            required
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as ReportCategory})}
            >
              {Object.values(ReportCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
            <div className="relative">
              <input 
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-10"
                placeholder="GPS or Landmark"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
              <i className="fa-solid fa-location-crosshairs absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
          <textarea 
            required
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            placeholder="Describe the situation in detail..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input 
            type="checkbox"
            id="hasImage"
            className="w-5 h-5 text-indigo-600 rounded"
            checked={formData.hasImage}
            onChange={(e) => setFormData({...formData, hasImage: e.target.checked})}
          />
          <label htmlFor="hasImage" className="text-sm font-medium text-slate-700">
            Attach image? (Note: Text reports sync faster)
          </label>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><i className="fa-solid fa-spinner animate-spin"></i> Saving...</>
          ) : (
            <><i className="fa-solid fa-paper-plane"></i> Submit Report</>
          )}
        </button>
      </form>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-tower-broadcast"></i>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Resilient Connect</span>
          </Link>
          <div className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-lg">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${location.pathname === '/' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/create" 
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${location.pathname === '/create' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              New Report
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-around items-center z-40">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fa-solid fa-table-columns text-xl"></i>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </Link>
        <Link to="/create" className={`flex flex-col items-center gap-1 ${location.pathname === '/create' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center -mt-10 shadow-lg border-4 border-slate-50">
            <i className="fa-solid fa-plus text-xl"></i>
          </div>
          <span className="text-[10px] font-bold uppercase mt-1">Report</span>
        </Link>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <i className="fa-solid fa-gear text-xl"></i>
          <span className="text-[10px] font-bold uppercase">Settings</span>
        </div>
      </nav>

      <NetworkIndicator />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateReport />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
