import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { io } from 'socket.io-client';
import SecurityTab from '../../components/SecurityTab';
import AnalyticsTab from '../../components/AnalyticsTab';
import DevicesTab from '../../components/DevicesTab';
import SettingsTab from '../../components/SettingsTab';
import NetworkDiscoveryTab from '../../components/NetworkDiscoveryTab';
import OverviewTab from '../../components/OverviewTab';
import ProfileTab from '../../components/ProfileTab';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    vulnerableDevices: 0,
    activeThreats: 0,
    networkHealth: 'Good',
    networkLoad: '27%',
    bandwidthUsage: {
      current: 88,
      limit: 100,
      unit: 'Mbps'
    },
    lastScan: new Date().toISOString()
  });
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadUserProfile();
    const newSocket = initializeSocket();
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const initializeSocket = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      console.log('Connecting to socket at:', BACKEND_URL);
      
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocketConnected(true);
        // Send authentication token
        newSocket.emit('authenticate', session.access_token);
        // Request initial data after authentication
        newSocket.emit('requestScan');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setSocketConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
      });

      newSocket.on('scanComplete', (data) => {
        console.log('Scan complete:', data);
        if (data.devices) {
          setDevices(data.devices);
        }
        if (data.stats) {
          setStats(data.stats);
        }
        setScanning(false);
      });

      newSocket.on('scanError', (error) => {
        console.error('Scan error:', error);
        setScanning(false);
      });

      newSocket.on('scanStart', () => {
        console.log('Scan started');
        setScanning(true);
      });

      newSocket.on('devicesUpdate', (data) => {
        console.log('Devices update:', data);
        if (data.devices) {
          setDevices(data.devices);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      });

      newSocket.on('deviceStatusChange', (data) => {
        console.log('Device status changed:', data);
        // Update the specific device in the devices array
        setDevices(prevDevices => 
          prevDevices.map(device => 
            device.id === data.id ? { ...device, ...data } : device
          )
        );
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      return null;
    }
  };

  const scanNetwork = async () => {
    if (!socket || scanning) {
      console.log('Cannot scan:', !socket ? 'No socket connection' : 'Scan in progress');
      return;
    }
    
    console.log('Requesting network scan');
    setScanning(true);
    socket.emit('requestScan');
  };

  const handleDeviceAction = async (action, device) => {
    switch (action) {
      case 'block':
        // Update device status in Supabase
        await supabase
          .from('devices')
          .update({ status: 'Blocked' })
          .match({ ip: device.ip });
        break;
      case 'quarantine':
        await supabase
          .from('devices')
          .update({ status: 'Quarantined' })
          .match({ ip: device.ip });
        break;
      case 'update':
        // Implement firmware update logic
        console.log('Update requested for device:', device);
        break;
    }

    // Refresh devices list
    scanNetwork();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const renderActiveTab = () => {
    if (!socketConnected) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Connecting to server...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab devices={devices} stats={stats} socket={socket} />;
      case 'network':
        return <NetworkDiscoveryTab devices={devices} stats={stats} socket={socket} />;
      case 'security':
        return <SecurityTab devices={devices} stats={stats} socket={socket} />;
      case 'analytics':
        return <AnalyticsTab devices={devices} stats={stats} socket={socket} />;
      case 'settings':
        return <SettingsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <OverviewTab devices={devices} stats={stats} socket={socket} />;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false); // Close menu after selecting a tab
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white">
      {/* Navigation Header */}
      <header className="bg-[#1E293B]/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-lg font-bold">IoT Sentinel</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'network' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Network Discovery
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'security' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'settings' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Profile
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-4 pt-2 pb-3 space-y-1 bg-[#1E293B]/50 backdrop-blur-xl border-t border-slate-800">
            <button
              onClick={() => handleTabClick('overview')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabClick('network')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'network' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Network Discovery
            </button>
            <button
              onClick={() => handleTabClick('security')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => handleTabClick('analytics')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => handleTabClick('settings')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'settings' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => handleTabClick('profile')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Action Bar */}
        {activeTab !== 'profile' && (
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Network Security Dashboard</h1>
              <p className="text-slate-400">Last scan: {new Date(stats.lastScan).toLocaleString()}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={() => handleDeviceAction('scan')}
                disabled={scanning}
                className="bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{scanning ? 'Scanning...' : 'Scan Network'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Tab Content */}
        <div className="overflow-x-auto">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
} 