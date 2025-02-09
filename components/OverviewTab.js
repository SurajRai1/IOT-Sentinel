import { useState, useEffect } from 'react';

export default function OverviewTab({ devices, stats, socket }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [securityScore, setSecurityScore] = useState(85);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!socket?.connected) return;

    const handleSecurityUpdate = (data) => {
      if (data.score) setSecurityScore(data.score);
    };

    const handleNewEvent = (event) => {
      setRecentEvents(prev => [event, ...prev].slice(0, 5));
    };

    // Add event listeners
    socket.on('securityUpdate', handleSecurityUpdate);
    socket.on('newEvent', handleNewEvent);

    // Cleanup function
    return () => {
      if (socket?.connected) {
        socket.off('securityUpdate', handleSecurityUpdate);
        socket.off('newEvent', handleNewEvent);
      }
    };
  }, [socket]);

  // Calculate device categories
  const deviceCategories = devices.reduce((acc, device) => {
    const category = device.type || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Calculate vulnerable devices
  const vulnerableDevices = devices.filter(device => 
    device.status === 'Vulnerable' || device.securityScore < 70
  );

  return (
    <div className="space-y-6">
      {/* Network Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#1E293B]/50 rounded-xl p-4 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Total Devices</h3>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{devices.length}</p>
          <p className="text-sm text-slate-400 mt-1">Connected to network</p>
        </div>

        <div className="bg-[#1E293B]/50 rounded-xl p-4 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Active Threats</h3>
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{vulnerableDevices.length}</p>
          <p className="text-sm text-slate-400 mt-1">Require attention</p>
        </div>

        <div className="bg-[#1E293B]/50 rounded-xl p-4 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Security Score</h3>
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{securityScore}%</p>
          <p className="text-sm text-slate-400 mt-1">Overall security rating</p>
        </div>

        <div className="bg-[#1E293B]/50 rounded-xl p-4 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Network Status</h3>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{stats.networkHealth || 'Good'}</p>
          <p className="text-sm text-slate-400 mt-1">Current performance</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <button className="bg-[#1E293B]/50 hover:bg-[#1E293B] rounded-xl p-4 sm:p-6 border border-slate-800 transition-colors group w-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-400/10 rounded-lg flex items-center justify-center group-hover:bg-blue-400/20 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-white font-medium truncate">Quick Scan</h3>
              <p className="text-sm text-slate-400 truncate">Run network scan</p>
            </div>
          </div>
        </button>

        <button className="bg-[#1E293B]/50 hover:bg-[#1E293B] rounded-xl p-4 sm:p-6 border border-slate-800 transition-colors group w-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-400/10 rounded-lg flex items-center justify-center group-hover:bg-red-400/20 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-white font-medium truncate">View Threats</h3>
              <p className="text-sm text-slate-400 truncate">Check vulnerabilities</p>
            </div>
          </div>
        </button>

        <button className="bg-[#1E293B]/50 hover:bg-[#1E293B] rounded-xl p-4 sm:p-6 border border-slate-800 transition-colors group w-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-400/10 rounded-lg flex items-center justify-center group-hover:bg-green-400/20 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-white font-medium truncate">Update All</h3>
              <p className="text-sm text-slate-400 truncate">Update device firmware</p>
            </div>
          </div>
        </button>

        <button className="bg-[#1E293B]/50 hover:bg-[#1E293B] rounded-xl p-4 sm:p-6 border border-slate-800 transition-colors group w-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-400/10 rounded-lg flex items-center justify-center group-hover:bg-purple-400/20 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-white font-medium truncate">Generate Report</h3>
              <p className="text-sm text-slate-400 truncate">Security summary</p>
            </div>
          </div>
        </button>
      </div>

      {/* Device Categories and Network Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Categories */}
        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4 sm:mb-6">Device Categories</h2>
          <div className="space-y-4 overflow-x-auto">
            {Object.entries(deviceCategories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between min-w-[250px]">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    category === 'IoT Device' ? 'bg-purple-400/10 text-purple-400' :
                    category === 'Router' ? 'bg-blue-400/10 text-blue-400' :
                    category === 'Security Camera' ? 'bg-green-400/10 text-green-400' :
                    'bg-slate-400/10 text-slate-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-white truncate">{category}</span>
                </div>
                <span className="text-slate-400 ml-2">{count} devices</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
          <div className="space-y-4 overflow-x-auto">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 min-w-[250px]">
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 ${
                  event.type === 'alert' ? 'bg-red-400/10 text-red-400' :
                  event.type === 'info' ? 'bg-blue-400/10 text-blue-400' :
                  'bg-green-400/10 text-green-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {event.type === 'alert' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    ) : event.type === 'info' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white truncate">{event.message}</p>
                  <p className="text-sm text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <p className="text-slate-400 text-center">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Security Recommendations</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {vulnerableDevices.map((device, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex-shrink-0 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium truncate">{device.name || device.ip}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {device.securityScore < 70 
                        ? 'Device has a low security score. Consider updating firmware and checking security settings.'
                        : 'Device requires attention. Check for potential vulnerabilities.'}
                    </p>
                    <button className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {vulnerableDevices.length === 0 && (
              <p className="text-slate-400 text-center">No security recommendations at this time</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 