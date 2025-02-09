import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NetworkDiscoveryTab({ devices, stats, socket }) {
  const [scanning, setScanning] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [hasScanPermission, setHasScanPermission] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkScanPermission();

    // Set up socket event listeners
    if (socket) {
      socket.on('scanComplete', handleScanComplete);
      socket.on('scanError', handleScanError);
    }

    // Cleanup socket listeners
    return () => {
      if (socket) {
        socket.off('scanComplete', handleScanComplete);
        socket.off('scanError', handleScanError);
      }
    };
  }, [socket]);

  const handleScanComplete = () => {
    console.log('Scan completed');
    setScanning(false);
  };

  const handleScanError = (error) => {
    console.error('Scan error:', error);
    setScanning(false);
    setError('Network scan failed: ' + error.message);
  };

  const checkScanPermission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('scan_permission')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      console.log('Profile scan permission:', profile?.scan_permission);
      setHasScanPermission(!!profile?.scan_permission);
    } catch (error) {
      console.error('Error checking scan permission:', error);
      setError(error.message);
    }
  };

  const handleScanPermission = async (allow) => {
    console.log('handleScanPermission called with:', allow);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found when updating permission');
        return;
      }

      console.log('Updating permission for user:', user.id);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ scan_permission: allow })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating permission:', updateError);
        setError(updateError.message);
        return;
      }

      console.log('Permission updated successfully');
      setHasScanPermission(allow);
      setShowPermissionDialog(false);

      if (allow) {
        console.log('Starting network scan...');
        startNetworkScan();
      }
    } catch (error) {
      console.error('Error in handleScanPermission:', error);
      setError(error.message);
    }
  };

  const startNetworkScan = () => {
    if (!socket?.connected) {
      console.log('Socket not connected');
      setError('Socket connection not available');
      return;
    }
    console.log('Emitting requestScan event');
    setScanning(true);
    socket.emit('requestScan');

    // Add a safety timeout to stop the scanning state after 30 seconds
    setTimeout(() => {
      if (scanning) {
        setScanning(false);
        setError('Scan timed out. Please try again.');
      }
    }, 30000);
  };

  const handleScanRequest = () => {
    console.log('Scan requested, hasPermission:', hasScanPermission);
    if (hasScanPermission) {
      startNetworkScan();
    } else {
      setShowPermissionDialog(true);
    }
  };

  // Show error message if there is one
  useEffect(() => {
    if (error) {
      console.error('Error:', error);
      // Clear error after 5 seconds
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}
      
      {/* Network Discovery Section */}
      <div className="bg-[#1E293B]/50 rounded-xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Network Discovery</h2>
            <p className="text-slate-400">Scan and identify devices on your network</p>
          </div>
          <button
            onClick={handleScanRequest}
            disabled={scanning}
            className="bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Scanning Network...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Scan Network</span>
              </>
            )}
          </button>
        </div>

        {/* Permission Dialog Modal */}
        {showPermissionDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Permission Required</h3>
              <p className="text-slate-300 mb-2">
                IoT Sentinel needs your permission to:
              </p>
              <ul className="list-disc list-inside mt-2 mb-6 space-y-2 text-slate-300">
                <li>Access your local network information</li>
                <li>Scan for IoT devices on your WiFi network</li>
                <li>Analyze device security and vulnerabilities</li>
              </ul>
              <p className="text-slate-400 text-sm mb-6">
                This scan will only be performed on your local network and helps identify potential security risks.
                No data will be shared outside your network without your consent.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => handleScanPermission(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={() => handleScanPermission(true)}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Allow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Network Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-slate-400 font-medium">Subnet</h3>
            <p className="text-xl font-bold text-white mt-1">{stats.subnet || '...'}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-slate-400 font-medium">Gateway</h3>
            <p className="text-xl font-bold text-white mt-1">{stats.gateway || '...'}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-slate-400 font-medium">IP Range</h3>
            <p className="text-xl font-bold text-white mt-1">{stats.ipRange || '...'}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-slate-400 font-medium">Devices Found</h3>
            <p className="text-xl font-bold text-white mt-1">{devices.length}</p>
          </div>
        </div>
      </div>

      {/* Discovered Devices Table */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Discovered Devices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">IP Address</th>
                <th className="text-left p-4 text-slate-400 font-medium">MAC Address</th>
                <th className="text-left p-4 text-slate-400 font-medium">Manufacturer</th>
                <th className="text-left p-4 text-slate-400 font-medium">Device Type</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Open Ports</th>
              </tr>
            </thead>
            <tbody>
              {devices.length > 0 ? (
                devices.map((device, index) => (
                  <tr key={index} className="border-b border-slate-800">
                    <td className="p-4 text-white">{device.ip}</td>
                    <td className="p-4 text-white">{device.mac}</td>
                    <td className="p-4 text-white">{device.manufacturer}</td>
                    <td className="p-4 text-white">{device.type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.status === 'Online' ? 'bg-green-400/10 text-green-400' :
                        device.status === 'Offline' ? 'bg-red-400/10 text-red-400' :
                        'bg-yellow-400/10 text-yellow-400'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="p-4 text-white">{device.openPorts?.join(', ') || 'None'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-400">
                    No devices discovered yet. Start a network scan to find devices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 