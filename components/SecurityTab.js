import { useState, useEffect } from 'react';

export default function SecurityTab({ devices, stats, socket }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for vulnerability updates
    socket.on('vulnerabilityUpdate', (data) => {
      setVulnerabilities(data.vulnerabilities);
    });

    // Listen for security incidents
    socket.on('securityIncident', (incident) => {
      setRecentIncidents(prev => [incident, ...prev].slice(0, 10)); // Keep last 10 incidents
    });

    // Listen for scan completion
    socket.on('scanComplete', () => {
      setScanning(false);
    });

    // Listen for scan errors
    socket.on('scanError', (error) => {
      console.error('Scan error:', error);
      setScanning(false);
    });

    // Listen for scan start
    socket.on('scanStart', () => {
      setScanning(true);
    });

    return () => {
      socket.off('vulnerabilityUpdate');
      socket.off('securityIncident');
      socket.off('scanComplete');
      socket.off('scanError');
      socket.off('scanStart');
    };
  }, [socket]);

  useEffect(() => {
    // Analyze devices for vulnerabilities
    const analyzeDevices = () => {
      const newVulnerabilities = devices.flatMap(device => {
        const deviceVulns = [];

        // Check for default passwords
        if (device.metadata?.defaultCredentials) {
          deviceVulns.push({
            id: `${device.id}-default-pass`,
            device: device.name,
            severity: 'High',
            type: 'Default Password',
            description: 'Device is using default manufacturer password',
            recommendation: 'Change default password to a strong unique password'
          });
        }

        // Check for open ports
        if (device.metadata?.openPorts?.length > 0) {
          const unnecessaryPorts = device.metadata.openPorts.filter(port => 
            !device.metadata.requiredPorts?.includes(port)
          );
          
          if (unnecessaryPorts.length > 0) {
            deviceVulns.push({
              id: `${device.id}-open-ports`,
              device: device.name,
              severity: 'Medium',
              type: 'Open Ports',
              description: `Unnecessary ports open: ${unnecessaryPorts.join(', ')}`,
              recommendation: 'Close unused ports to reduce attack surface'
            });
          }
        }

        // Check firmware version
        if (device.metadata?.firmwareVersion && device.metadata?.latestFirmware && 
            device.metadata.firmwareVersion !== device.metadata.latestFirmware) {
          deviceVulns.push({
            id: `${device.id}-firmware`,
            device: device.name,
            severity: 'Medium',
            type: 'Firmware',
            description: 'Device firmware is outdated',
            recommendation: 'Update to latest firmware version'
          });
        }

        // Check encryption
        if (device.metadata?.encryption === 'none' || device.metadata?.encryption === 'weak') {
          deviceVulns.push({
            id: `${device.id}-encryption`,
            device: device.name,
            severity: 'High',
            type: 'Weak Encryption',
            description: 'Device is using weak or no encryption',
            recommendation: 'Enable strong encryption (WPA3 for WiFi devices)'
          });
        }

        return deviceVulns;
      });

      setVulnerabilities(newVulnerabilities);
    };

    analyzeDevices();
  }, [devices]);

  const startVulnerabilityScan = () => {
    if (!socket || scanning) return;
    
    setScanning(true);
    socket.emit('requestScan');
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium">Vulnerability Status</h3>
            <div className={`w-3 h-3 rounded-full ${
              vulnerabilities.length === 0 ? 'bg-green-400' :
              vulnerabilities.length < 3 ? 'bg-yellow-400' :
              'bg-red-400'
            }`}></div>
          </div>
          <p className="text-3xl font-bold text-white">{vulnerabilities.length}</p>
          <p className="text-sm text-slate-400 mt-1">Active Vulnerabilities</p>
        </div>

        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium">Threat Detection</h3>
            <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeThreats}</p>
          <p className="text-sm text-slate-400 mt-1">Active Threats</p>
        </div>

        <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium">Security Score</h3>
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">
            {Math.max(0, 100 - (vulnerabilities.length * 10) - (stats.activeThreats * 15))}%
          </p>
          <p className="text-sm text-slate-400 mt-1">Overall Security</p>
        </div>
      </div>

      {/* Add Scan Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={startVulnerabilityScan}
          disabled={scanning}
          className="bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{scanning ? 'Scanning...' : 'Start Security Scan'}</span>
        </button>
      </div>

      {/* Recent Vulnerabilities */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Recent Vulnerabilities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Device</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Severity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-sm text-white">{vuln.device}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{vuln.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vuln.severity === 'High' ? 'bg-red-400/10 text-red-400' :
                      vuln.severity === 'Medium' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-blue-400/10 text-blue-400'
                    }`}>
                      {vuln.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{vuln.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{vuln.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Security Incidents */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Recent Security Incidents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Device</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(incident.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{incident.device}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{incident.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      incident.status === 'Resolved' ? 'bg-green-400/10 text-green-400' :
                      incident.status === 'Investigating' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-red-400/10 text-red-400'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 