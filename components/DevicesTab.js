import { useState, useEffect } from 'react';

export default function DevicesTab({ devices, onDeviceAction }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState(new Map());

  // Clear recent updates after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recentUpdates.size > 0) {
        setRecentUpdates(new Map());
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [recentUpdates]);

  // Update recent updates when devices change
  useEffect(() => {
    const newUpdates = new Map();
    devices.forEach(device => {
      const existingDevice = recentUpdates.get(device.id);
      if (existingDevice && (existingDevice.status !== device.status || existingDevice.securityScore !== device.securityScore)) {
        newUpdates.set(device.id, {
          status: device.status,
          securityScore: device.securityScore,
          timestamp: new Date().getTime()
        });
      }
    });
    if (newUpdates.size > 0) {
      setRecentUpdates(newUpdates);
    }
  }, [devices]);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const deviceTypes = {
    'Router/Gateway': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      color: 'text-indigo-400'
    },
    'Android Phone': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-emerald-400'
    },
    'Computer': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-400'
    },
    'iPhone': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-gray-400'
    },
    'Mac Computer': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-gray-400'
    },
    'Smart Light': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'text-yellow-400'
    },
    'Smart Thermostat': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      color: 'text-orange-400'
    },
    'Security Camera': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-red-400'
    },
    'Smart Lock': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'text-blue-400'
    },
    'Smart Hub': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-purple-400'
    },
    'Smart Speaker': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
        </svg>
      ),
      color: 'text-pink-400'
    },
    'Smart Doorbell': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9a3 3 0 11-6 0 3 3 0 016 0zm6 8a6 6 0 01-7.743 5.743L11 21l-1 1-1-1-2.257-2.257A6 6 0 115 17v-2a4 4 0 116.8-2.829" />
        </svg>
      ),
      color: 'text-indigo-400'
    },
    'Smart Display': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-cyan-400'
    },
    'Samsung Device': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-400'
    },
    'Unknown Device': {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-slate-400'
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search devices..."
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex space-x-4 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
          >
            <option value="all">All Status</option>
            <option value="Secured">Secured</option>
            <option value="Warning">Warning</option>
            <option value="Blocked">Blocked</option>
            <option value="Quarantined">Quarantined</option>
          </select>
          <button
            onClick={() => onDeviceAction('scan')}
            className="bg-[#3B82F6] hover:bg-[#2563EB] px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Scan for Devices
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const isRecent = recentUpdates.has(device.id);
          return (
            <div
              key={device.id}
              className={`bg-[#1E293B]/50 rounded-xl border border-slate-800 p-6 hover:border-[#3B82F6]/50 transition-all cursor-pointer ${
                isRecent ? 'animate-pulse shadow-lg shadow-slate-700/20' : ''
              }`}
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    deviceTypes[device.type]?.color || deviceTypes['Unknown Device'].color
                  }`}>
                    {deviceTypes[device.type]?.icon || deviceTypes['Unknown Device'].icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{device.name}</h3>
                    <p className="text-sm text-slate-400">{device.type}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  device.status === 'Secured' ? 'bg-green-400/10 text-green-400' :
                  device.status === 'Warning' ? 'bg-yellow-400/10 text-yellow-400' :
                  device.status === 'Blocked' ? 'bg-red-400/10 text-red-400' :
                  'bg-orange-400/10 text-orange-400'
                } ${isRecent ? 'animate-bounce' : ''}`}>
                  {device.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">IP Address</span>
                  <span className="text-white">{device.ip}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">MAC Address</span>
                  <span className="text-white">{device.details?.mac || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Manufacturer</span>
                  <span className="text-white">{device.manufacturer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Model</span>
                  <span className="text-white">{device.model}</span>
                </div>
                {device.details?.firmwareVersion && device.details.firmwareVersion !== 'Unknown' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Firmware</span>
                    <span className="text-white">{device.details.firmwareVersion}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeviceAction('block', device);
                    }}
                    className="flex-1 px-3 py-2 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Block
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeviceAction('quarantine', device);
                    }}
                    className="flex-1 px-3 py-2 bg-orange-400/10 hover:bg-orange-400/20 text-orange-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Quarantine
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeviceAction('update', device);
                    }}
                    className="flex-1 px-3 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] rounded-lg text-sm font-medium transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  deviceTypes[selectedDevice.type]?.color || deviceTypes['Unknown Device'].color
                }`}>
                  {deviceTypes[selectedDevice.type]?.icon || deviceTypes['Unknown Device'].icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedDevice.name}</h2>
                  <p className="text-slate-400">{selectedDevice.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Device Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">IP Address</span>
                    <span className="text-sm text-white">{selectedDevice.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">MAC Address</span>
                    <span className="text-sm text-white">{selectedDevice.details?.mac || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Manufacturer</span>
                    <span className="text-sm text-white">{selectedDevice.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Model</span>
                    <span className="text-sm text-white">{selectedDevice.model}</span>
                  </div>
                  {selectedDevice.details?.firmwareVersion && selectedDevice.details.firmwareVersion !== 'Unknown' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Firmware Version</span>
                      <span className="text-sm text-white">{selectedDevice.details.firmwareVersion}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Operating System</span>
                    <span className="text-sm text-white">{selectedDevice.details?.os || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Last Seen</span>
                    <span className="text-sm text-white">{new Date(selectedDevice.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Capabilities & Security</h3>
                <div className="space-y-4">
                  {selectedDevice.details?.capabilities && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Device Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDevice.details.capabilities.map((capability, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">Security Status</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedDevice.status === 'Secured' ? 'bg-green-400/10 text-green-400' :
                        selectedDevice.status === 'Warning' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-red-400/10 text-red-400'
                      }`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-400">Security Score</span>
                        <span className="text-xs text-white">{selectedDevice.securityScore}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            selectedDevice.securityScore > 70 ? 'bg-green-400' :
                            selectedDevice.securityScore > 40 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${selectedDevice.securityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {selectedDevice.details?.openPorts && selectedDevice.details.openPorts.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Open Ports</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDevice.details.openPorts.map((port, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300"
                          >
                            Port {port}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between space-x-4">
              <button
                onClick={() => {
                  onDeviceAction('block', selectedDevice);
                  setSelectedDevice(null);
                }}
                className="flex-1 px-4 py-2 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                Block Device
              </button>
              <button
                onClick={() => {
                  onDeviceAction('quarantine', selectedDevice);
                  setSelectedDevice(null);
                }}
                className="flex-1 px-4 py-2 bg-orange-400/10 hover:bg-orange-400/20 text-orange-400 rounded-lg text-sm font-medium transition-colors"
              >
                Quarantine Device
              </button>
              <button
                onClick={() => {
                  onDeviceAction('update', selectedDevice);
                  setSelectedDevice(null);
                }}
                className="flex-1 px-4 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] rounded-lg text-sm font-medium transition-colors"
              >
                Update Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 