import { useState } from 'react';

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      securityAlerts: true,
      deviceUpdates: false,
      weeklyReports: true
    },
    security: {
      autoBlockThreats: true,
      scanInterval: 30,
      threatSensitivity: 'medium',
      autoUpdate: true,
      twoFactorAuth: false
    },
    network: {
      dhcpServer: true,
      ipRange: {
        start: '192.168.1.100',
        end: '192.168.1.200'
      },
      dns: {
        primary: '8.8.8.8',
        secondary: '8.8.4.4'
      }
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (category, parent, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parent]: {
          ...prev[category][parent],
          [setting]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notifications Settings */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
          <p className="mt-1 text-sm text-slate-400">Manage how you receive notifications and alerts</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-sm text-slate-400">Receive security alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.email}
                onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Push Notifications</h3>
              <p className="text-sm text-slate-400">Get instant alerts on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.push}
                onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Security Alerts</h3>
              <p className="text-sm text-slate-400">Get notified about security threats</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.securityAlerts}
                onChange={(e) => handleSettingChange('notifications', 'securityAlerts', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Device Updates</h3>
              <p className="text-sm text-slate-400">Notifications about device firmware updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.deviceUpdates}
                onChange={(e) => handleSettingChange('notifications', 'deviceUpdates', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Weekly Reports</h3>
              <p className="text-sm text-slate-400">Receive weekly security summary reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.weeklyReports}
                onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Security Settings</h2>
          <p className="mt-1 text-sm text-slate-400">Configure your security preferences</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Auto-block Threats</h3>
              <p className="text-sm text-slate-400">Automatically block detected threats</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.security.autoBlockThreats}
                onChange={(e) => handleSettingChange('security', 'autoBlockThreats', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-medium">Scan Interval</h3>
                <p className="text-sm text-slate-400">How often to scan the network (minutes)</p>
              </div>
              <span className="text-white font-medium">{settings.security.scanInterval} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={settings.security.scanInterval}
              onChange={(e) => handleSettingChange('security', 'scanInterval', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <h3 className="text-white font-medium mb-2">Threat Sensitivity</h3>
            <p className="text-sm text-slate-400 mb-4">Adjust how sensitive the threat detection should be</p>
            <div className="flex space-x-4">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleSettingChange('security', 'threatSensitivity', level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    settings.security.threatSensitivity === level
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Auto Update</h3>
              <p className="text-sm text-slate-400">Automatically update device firmware</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.security.autoUpdate}
                onChange={(e) => handleSettingChange('security', 'autoUpdate', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-400">Add an extra layer of security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="bg-[#1E293B]/50 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Network Configuration</h2>
          <p className="mt-1 text-sm text-slate-400">Configure network settings</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">DHCP Server</h3>
              <p className="text-sm text-slate-400">Automatically assign IP addresses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.network.dhcpServer}
                onChange={(e) => handleSettingChange('network', 'dhcpServer', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-4">IP Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Start IP</label>
                  <input
                    type="text"
                    value={settings.network.ipRange.start}
                    onChange={(e) => handleNestedSettingChange('network', 'ipRange', 'start', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">End IP</label>
                  <input
                    type="text"
                    value={settings.network.ipRange.end}
                    onChange={(e) => handleNestedSettingChange('network', 'ipRange', 'end', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">DNS Servers</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Primary DNS</label>
                  <input
                    type="text"
                    value={settings.network.dns.primary}
                    onChange={(e) => handleNestedSettingChange('network', 'dns', 'primary', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Secondary DNS</label>
                  <input
                    type="text"
                    value={settings.network.dns.secondary}
                    onChange={(e) => handleNestedSettingChange('network', 'dns', 'secondary', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => console.log('Settings saved:', settings)}
          className="bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
} 