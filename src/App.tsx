import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveFleetView } from './views/LiveFleetView';
import { HistoryReplayView } from './views/HistoryReplayView';
import { GeofenceView } from './views/GeofenceView';
import { AlertsView } from './views/AlertsView';
import { ReportsView } from './views/ReportsView';
import { MobileTrackerMode } from './views/MobileTrackerMode';
import { TripsView } from './views/TripsView';
import { DeviceManagerView } from './views/DeviceManagerView';
import { LandingPage } from './views/LandingPage';
import { apiRequest, getSocket } from './services/api';
import { Tracker, Geofence, Alert } from './types';
import { Navigation, Lock, LogIn, ArrowLeft } from 'lucide-react';

interface MainDashboardProps {
  onReturnToLanding: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ onReturnToLanding }) => {
  const [activeTab, setActiveTab] = useState('live');
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Fetch initial fleet data
  const loadFleetData = async () => {
    try {
      const [tData, gData, aData] = await Promise.all([
        apiRequest<Tracker[]>('/trackers'),
        apiRequest<Geofence[]>('/geofences'),
        apiRequest<Alert[]>('/alerts')
      ]);
      setTrackers(tData);
      setGeofences(gData);
      setAlerts(aData);
      if (tData.length > 0 && !selectedTrackerId) {
        setSelectedTrackerId(tData[0].id);
      }
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    }
  };

  useEffect(() => {
    loadFleetData();

    // Socket.IO Real-Time Stream Listeners
    const socket = getSocket();

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('trackers:init', (data: Tracker[]) => {
      setTrackers(data);
    });

    socket.on('tracker:location', (data: any) => {
      setTrackers(prev =>
        prev.map(t => {
          if (t.id === data.trackerId) {
            return {
              ...t,
              lastLatitude: data.latitude,
              lastLongitude: data.longitude,
              lastSpeed: data.speed,
              lastHeading: data.heading,
              batteryLevel: data.battery,
              lastSeen: data.lastSeen,
              trackingStatus: 'ONLINE'
            };
          }
          return t;
        })
      );
    });

    socket.on('tracker:status', (data: any) => {
      setTrackers(prev =>
        prev.map(t => (t.id === data.trackerId ? { ...t, trackingStatus: data.status, lastSeen: data.lastSeen } : t))
      );
    });

    socket.on('alert:created', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('trackers:init');
      socket.off('tracker:location');
      socket.off('tracker:status');
      socket.off('alert:created');
    };
  }, []);

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="w-screen h-screen flex flex-col bg-dark-900 overflow-hidden">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
        isSocketConnected={isSocketConnected}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadAlertsCount={unreadAlertsCount}
        />
        <main className="flex-1 h-full overflow-hidden bg-dark-900 relative">
          {/* Quick back to Landing Page button floating */}
          <button
            onClick={onReturnToLanding}
            className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-dark-600 text-xs font-semibold text-slate-300 hover:text-white transition backdrop-blur-sm flex items-center gap-1.5"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Site</span>
          </button>

          {activeTab === 'live' && (
            <LiveFleetView
              trackers={trackers}
              selectedTrackerId={selectedTrackerId}
              setSelectedTrackerId={setSelectedTrackerId}
              geofences={geofences}
              onRefresh={loadFleetData}
            />
          )}
          {activeTab === 'trips' && <TripsView trackers={trackers} />}
          {activeTab === 'history' && <HistoryReplayView trackers={trackers} />}
          {activeTab === 'geofence' && <GeofenceView geofences={geofences} onRefresh={loadFleetData} />}
          {activeTab === 'alerts' && <AlertsView alerts={alerts} onRefresh={loadFleetData} />}
          {activeTab === 'reports' && <ReportsView trackers={trackers} />}
          {activeTab === 'devices' && <DeviceManagerView trackers={trackers} onRefresh={loadFleetData} />}
          {activeTab === 'simulator' && <MobileTrackerMode trackers={trackers} onRefresh={loadFleetData} />}
        </main>
      </div>
    </div>
  );
};

const LoginScreen: React.FC<{ onReturnToLanding: () => void }> = ({ onReturnToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@trackx.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid login details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-dark-900 flex items-center justify-center p-4 relative">
      <button
        onClick={onReturnToLanding}
        className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Landing Page</span>
      </button>

      <div className="w-full max-w-md bg-dark-800 border border-dark-700 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/30">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <Navigation className="w-7 h-7 text-blue-400 transform -rotate-45" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Track<span className="text-blue-500">X</span> Platform</h1>
          <p className="text-xs text-slate-400">Industry-Ready Real-Time GPS Tracking Dashboard</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        {/* Quick Demo Sign-In Action */}
        <button
          onClick={() => login('admin@trackx.com', 'admin123')}
          className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚀 Instant Demo Sign-In (Rahul Admin)</span>
        </button>

        <div className="bg-dark-900/60 p-3 rounded-2xl border border-dark-700/60 text-[11px] text-slate-400 text-center space-y-1">
          <div className="font-bold text-slate-300">DEMO CREDENTIALS</div>
          <div>Admin: <span className="font-mono text-blue-400">admin@trackx.com</span> / <span className="font-mono text-blue-400">admin123</span></div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [viewState, setViewState] = useState<'LANDING' | 'APP'>('LANDING');

  if (loading) {
    return (
      <div className="w-screen h-screen bg-dark-900 flex items-center justify-center text-slate-400 text-sm">
        Initializing TrackX Platform...
      </div>
    );
  }

  if (viewState === 'LANDING') {
    return (
      <LandingPage
        onLaunchDashboard={() => setViewState('APP')}
        onOpenMobileTracker={() => setViewState('APP')}
      />
    );
  }

  return user ? (
    <MainDashboard onReturnToLanding={() => setViewState('LANDING')} />
  ) : (
    <LoginScreen onReturnToLanding={() => setViewState('LANDING')} />
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
