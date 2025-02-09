import { useState, useEffect } from 'react';

export default function AnalyticsTab({ devices, stats, socket }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [networkData, setNetworkData] = useState({
    labels: [],
    incoming: [],
    outgoing: []
  });
  const [deviceActivities, setDeviceActivities] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time network updates
    socket.on('networkUpdate', (data) => {
      setNetworkData(prev => ({
        labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-8),
        incoming: [...prev.incoming, data.incoming].slice(-8),
        outgoing: [...prev.outgoing, data.outgoing].slice(-8)
      }));
    });

    // Listen for device activity updates
    socket.on('deviceActivity', (activity) => {
      setDeviceActivities(prev => [activity, ...prev].slice(0, 10)); // Keep last 10 activities
    });

    // Listen for network anomalies
    socket.on('networkAnomaly', (anomaly) => {
      setAnomalies(prev => [anomaly, ...prev].slice(0, 3)); // Keep last 3 anomalies
    });

    return () => {
      socket.off('networkUpdate');
      socket.off('deviceActivity');
      socket.off('networkAnomaly');
    };
  }, [socket]);

  // Calculate network statistics
  const calculateNetworkStats = () => {
    if (!networkData.incoming.length) return null;

    const totalIncoming = networkData.incoming.reduce((a, b) => a + b, 0);
    const totalOutgoing = networkData.outgoing.reduce((a, b) => a + b, 0);
    const avgIncoming = totalIncoming / networkData.incoming.length;
    const avgOutgoing = totalOutgoing / networkData.outgoing.length;

    return {
      avgIncoming: avgIncoming.toFixed(2),
      avgOutgoing: avgOutgoing.toFixed(2),
      peakIncoming: Math.max(...networkData.incoming),
      peakOutgoing: Math.max(...networkData.outgoing)
    };
  };

  const networkStats = calculateNetworkStats();

  const trafficData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    incoming: [20, 35, 15, 45, 30, 25, 40, 35],
    outgoing: [15, 25, 10, 30, 25, 20, 35, 30]
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Network Statistics */}
      {networkStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1E293B]/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-slate-400 font-medium">Avg Incoming</h3>
            <p className="text-3xl font-bold text-white mt-2">{networkStats.avgIncoming} Mbps</p>
          </div>
          <div className="bg-[#1E293B]/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-slate-400 font-medium">Avg Outgoing</h3>
            <p className="text-3xl font-bold text-white mt-2">{networkStats.avgOutgoing} Mbps</p>
          </div>
          <div className="bg-[#1E293B]/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-slate-400 font-medium">Peak Incoming</h3>
            <p className="text-3xl font-bold text-white mt-2">{networkStats.peakIncoming} Mbps</p>
          </div>
          <div className="bg-[#1E293B]/50 rounded-xl p-6 border border-slate-800">
            <h3 className="text-slate-400 font-medium">Peak Outgoing</h3>
            <p className="text-3xl font-bold text-white mt-2">{networkStats.peakOutgoing} Mbps</p>
          </div>
        </div>
      )}

      {/* Network Traffic Analysis */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Network Traffic Analysis</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time network traffic monitoring</p>
          </div>
        </div>
        
        <div className="relative h-80">
          {/* Y-axis labels */}
          <div className="absolute -left-2 top-0 bottom-0 w-14 flex flex-col justify-between text-xs text-slate-400">
            <span>50 Mbps</span>
            <span>40 Mbps</span>
            <span>30 Mbps</span>
            <span>20 Mbps</span>
            <span>10 Mbps</span>
            <span>0 Mbps</span>
          </div>

          {/* Graph area */}
          <div className="absolute left-14 right-0 top-0 bottom-0">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-rows-5 gap-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="border-t border-slate-700/50 relative"
                >
                  {i < 5 && (
                    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-slate-700/50 via-slate-700/25 to-slate-700/50" />
                  )}
                </div>
              ))}
            </div>

            {/* Traffic data visualization */}
            <div className="relative h-full grid grid-cols-8 gap-4 z-10">
              {trafficData.incoming.map((value, index) => (
                <div key={index} className="relative flex items-end h-full">
                  {/* Incoming traffic */}
                  <div
                    className="absolute w-full bg-gradient-to-t from-blue-500/20 to-blue-500/5 rounded-t"
                    style={{ 
                      height: `${(value / 50) * 100}%`,
                      bottom: 0
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 rounded-t" />
                  </div>

                  {/* Outgoing traffic */}
                  <div
                    className="absolute w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/5 rounded-t"
                    style={{ 
                      height: `${(trafficData.outgoing[index] / 50) * 100}%`,
                      bottom: 0,
                      opacity: 0.8
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 rounded-t" />
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 hover:bg-slate-700/10 rounded-lg transition-colors cursor-pointer group">
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 rounded-lg text-xs text-white">
                      <div className="text-center mb-1">{trafficData.labels[index]}</div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">↓ {value} Mbps</span>
                        <span className="text-emerald-400">↑ {trafficData.outgoing[index]} Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="absolute left-0 right-0 bottom-0 mt-4 grid grid-cols-8 gap-4 text-xs text-slate-400">
              {trafficData.labels.map((label, index) => (
                <div key={index} className="text-center">{label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-slate-400">Incoming Traffic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-slate-400">Outgoing Traffic</span>
          </div>
        </div>
      </div>

      {/* Device Activity Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Data Usage by Device</h2>
          <div className="space-y-4">
            {devices.map((device, index) => (
              <div key={device.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    device.type === 'Camera' ? 'bg-purple-400/10 text-purple-400' :
                    device.type === 'Smart Lock' ? 'bg-blue-400/10 text-blue-400' :
                    'bg-green-400/10 text-green-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{device.name}</p>
                    <p className="text-sm text-slate-400">{device.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{Math.floor(Math.random() * 10)} GB</p>
                  <p className="text-sm text-slate-400">Used</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Connection Statistics</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Network Stability</span>
                <span className="text-white">98%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Average Response Time</span>
                <span className="text-white">45ms</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Packet Loss</span>
                <span className="text-white">0.1%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Device Activities */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Recent Device Activities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Device</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Activity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Data Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {deviceActivities.map((activity, index) => (
                <tr key={index} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{activity.device}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{activity.activity}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{activity.dataUsage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Anomalies */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Network Anomaly Detection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {anomalies.map((anomaly, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              anomaly.severity === 'high' ? 'bg-red-400/10 border-red-400/20' :
              anomaly.severity === 'medium' ? 'bg-yellow-400/10 border-yellow-400/20' :
              'bg-green-400/10 border-green-400/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${
                  anomaly.severity === 'high' ? 'text-red-400' :
                  anomaly.severity === 'medium' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>{anomaly.type}</h3>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={anomaly.severity === 'high' ? 
                      "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" :
                      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    }
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400">{anomaly.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 