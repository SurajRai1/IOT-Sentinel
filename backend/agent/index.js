const EventEmitter = require('events');
const DeviceDetector = require('./modules/deviceDetector');
const DeviceIdentifier = require('./modules/deviceIdentifier');

class IoTAgent extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = {
            scanInterval: options.scanInterval || 300000, // 5 minutes
            statusCheckInterval: options.statusCheckInterval || 10000, // 10 seconds
            autoStart: options.autoStart || false,
            networkMonitorInterval: options.networkMonitorInterval || 5000
        };

        this.detector = new DeviceDetector();
        this.identifier = new DeviceIdentifier();
        this.devices = new Map();
        this.stats = {
            totalDevices: 0,
            activeDevices: 0,
            vulnerableDevices: 0,
            quarantinedDevices: 0
        };
        this.networkStats = {
            incoming: [],
            outgoing: [],
            anomalies: []
        };
        this.isRunning = false;
        this.statusCheckTimer = null;
        this.networkMonitorTimer = null;
        this.anomalyThresholds = {
            bandwidth: options.bandwidthThreshold || 90, // 90% of max bandwidth
            connections: options.connectionsThreshold || 100 // 100 connections per device
        };

        // Forward relevant events
        this.detector.on('scanStart', () => this.emit('scanStart'));
        this.detector.on('scanComplete', (devices) => this.processDevices(devices));
        this.detector.on('scanError', (error) => this.emit('error', error));
    }

    async start() {
        if (this.isRunning) {
            console.log('Agent already running');
            return;
        }
        
        // Reset state before starting
        this.detector.resetScanState();
        this.devices.clear();
        
        this.isRunning = true;
        this.emit('agentStart');

        try {
            // Start periodic scanning
            this.detector.startPeriodicScan(this.options.scanInterval);
            
            // Start real-time status monitoring
            this.startStatusMonitoring();
            
            // Start network monitoring
            this.startNetworkMonitoring();
            
            // Wait a moment before initial scan to avoid race conditions
            setTimeout(async () => {
                try {
                    await this.scan();
                } catch (error) {
                    console.error('Initial scan error:', error);
                    this.emit('error', error);
                }
            }, 1000);
        } catch (error) {
            console.error('Agent start error:', error);
            this.emit('error', error);
            this.stop();
        }
    }

    stop() {
        if (!this.isRunning) {
            console.log('Agent already stopped');
            return;
        }
        
        this.isRunning = false;
        this.detector.resetScanState();
        this.detector.stopPeriodicScan();
        this.stopStatusMonitoring();
        this.stopNetworkMonitoring();
        this.devices.clear();
        this.emit('agentStop');
    }

    startStatusMonitoring() {
        if (this.statusCheckTimer) {
            clearInterval(this.statusCheckTimer);
        }

        this.statusCheckTimer = setInterval(async () => {
            try {
                const devices = Array.from(this.devices.values());
                let hasChanges = false;

                for (const device of devices) {
                    const previousStatus = device.status;
                    const previousScore = device.securityScore;

                    // Reassess device security
                    device.status = this.assessDeviceSecurity(device);
                    device.securityScore = this.calculateSecurityScore(device);
                    device.lastChecked = new Date().toISOString();

                    // Check if status or score has changed
                    if (previousStatus !== device.status || previousScore !== device.securityScore) {
                        hasChanges = true;
                        this.emit('deviceStatusChange', {
                            deviceId: device.id,
                            previousStatus,
                            newStatus: device.status,
                            previousScore,
                            newScore: device.securityScore
                        });
                    }
                }

                // If any device status changed, emit a full update
                if (hasChanges) {
                    const stats = this.calculateNetworkStats();
                    this.emit('devicesUpdate', {
                        devices: Array.from(this.devices.values()),
                        stats,
                        updateType: 'status'
                    });
                }
            } catch (error) {
                console.error('Error in status monitoring:', error);
                this.emit('error', error);
            }
        }, this.options.statusCheckInterval);
    }

    stopStatusMonitoring() {
        if (this.statusCheckTimer) {
            clearInterval(this.statusCheckTimer);
            this.statusCheckTimer = null;
        }
    }

    startNetworkMonitoring() {
        // Start monitoring network traffic and device activities
        this.networkMonitorTimer = setInterval(() => {
            this.monitorNetworkTraffic();
            this.detectAnomalies();
        }, this.options.networkMonitorInterval);
    }

    stopNetworkMonitoring() {
        if (this.networkMonitorTimer) {
            clearInterval(this.networkMonitorTimer);
            this.networkMonitorTimer = null;
        }
    }

    async monitorNetworkTraffic() {
        try {
            // Monitor each device's network activity
            for (const [deviceId, device] of this.devices) {
                const activity = await this.getDeviceActivity(device);
                if (activity) {
                    this.emit('deviceActivity', {
                        deviceId,
                        deviceName: device.name,
                        type: activity.type,
                        dataUsage: activity.dataUsage
                    });
                }
            }
        } catch (error) {
            console.error('Error monitoring network traffic:', error);
        }
    }

    async getDeviceActivity(device) {
        try {
            // Implement actual device activity monitoring here
            // This is a placeholder implementation
            const activities = ['Data Transfer', 'Status Update', 'Configuration Change'];
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            const dataUsage = `${Math.floor(Math.random() * 1000)} KB`;
            
            return {
                type: randomActivity,
                dataUsage
            };
        } catch (error) {
            console.error(`Error getting activity for device ${device.name}:`, error);
            return null;
        }
    }

    detectAnomalies() {
        try {
            // Check for bandwidth anomalies
            for (const [deviceId, device] of this.devices) {
                const bandwidthUsage = Math.random() * 100; // Replace with actual bandwidth monitoring
                if (bandwidthUsage > this.anomalyThresholds.bandwidth) {
                    this.emit('anomalyDetected', {
                        type: 'High Bandwidth Usage',
                        severity: 'high',
                        description: `Device ${device.name} is using ${bandwidthUsage.toFixed(1)}% of available bandwidth`,
                        deviceId
                    });
                }

                // Check for connection anomalies
                const connectionCount = Math.floor(Math.random() * 150); // Replace with actual connection counting
                if (connectionCount > this.anomalyThresholds.connections) {
                    this.emit('anomalyDetected', {
                        type: 'Excessive Connections',
                        severity: 'medium',
                        description: `Device ${device.name} has ${connectionCount} active connections`,
                        deviceId
                    });
                }

                // Check for unusual patterns
                if (Math.random() < 0.1) { // 10% chance of detecting an unusual pattern
                    this.emit('anomalyDetected', {
                        type: 'Unusual Traffic Pattern',
                        severity: 'low',
                        description: `Unusual traffic pattern detected for ${device.name}`,
                        deviceId
                    });
                }
            }
        } catch (error) {
            console.error('Error detecting anomalies:', error);
        }
    }

    async scan() {
        const scanStatus = this.detector.getScanStatus();
        const scanDuration = scanStatus.scanDuration || 0;

        if (this.detector.isScanning) {
            if (scanDuration > 60000) {
                console.log('Forcing scan reset due to timeout');
                this.detector.resetScanState();
            } else {
                console.log('Scan already in progress, duration:', scanDuration, 'ms');
                throw new Error('Scan already in progress');
            }
        }
        
        try {
            console.log('Starting new scan...');
            
            // Emit scan start event
            this.emit('scanStart');
            
            // Perform network scan
            const devices = await this.detector.startScan();
            
            // Process and analyze devices
            const processedDevices = await this.processDevices(devices);
            
            // Update network stats
            const stats = this.calculateNetworkStats();
            
            // Store processed devices in the agent's state
            processedDevices.forEach(device => {
                this.devices.set(device.id, device);
            });
            
            // Return both devices and stats
            return processedDevices;
        } catch (error) {
            console.error('Scan error:', error);
            this.detector.resetScanState();
            this.emit('error', error);
            throw error;
        }
    }

    async processDevices(devices) {
        try {
            console.log('Processing devices:', devices);
            // Process each device through the identifier with enhanced information
            const identifiedDevices = await Promise.all(
                devices.map(async device => {
                    try {
                        // Enhance device information with service details
                        const enhancedDevice = { ...device };
                        
                        // Use service information to better identify device type
                        if (device.services) {
                            enhancedDevice.serviceInfo = device.services.map(service => ({
                                port: service.port,
                                name: service.name,
                                version: service.version
                            }));
                        }

                        // Get detailed device information
                        const identifiedDevice = await this.identifier.identifyDevice(enhancedDevice);
                        
                        // Ensure required fields
                        if (!identifiedDevice.id) {
                            identifiedDevice.id = identifiedDevice.mac || identifiedDevice.ip;
                        }
                        
                        // Update status based on security assessment
                        identifiedDevice.status = this.assessDeviceSecurity(identifiedDevice);
                        
                        // Calculate security score
                        identifiedDevice.securityScore = this.calculateSecurityScore(identifiedDevice);
                        
                        return identifiedDevice;
                    } catch (error) {
                        console.error(`Error processing device ${device.ip}:`, error);
                        return device;
                    }
                })
            );

            console.log('Identified devices:', identifiedDevices);

            // Update devices map with timestamps
            const timestamp = new Date().toISOString();
            identifiedDevices.forEach(device => {
                device.lastSeen = timestamp;
                this.devices.set(device.id, device);
            });

            // Calculate network stats with enhanced information
            const stats = this.calculateNetworkStats();

            // Emit update event with detailed information
            const updateData = {
                devices: Array.from(this.devices.values()),
                stats: stats,
                scanDetails: {
                    timestamp,
                    duration: this.detector.lastScanDuration,
                    deviceCount: identifiedDevices.length,
                    newDevices: this.countNewDevices(identifiedDevices)
                }
            };
            
            console.log('Emitting device update:', updateData);
            this.emit('devicesUpdate', updateData);

            return identifiedDevices;
        } catch (error) {
            console.error('Error processing devices:', error);
            this.emit('error', error);
            return [];
        }
    }

    assessDeviceSecurity(device) {
        // Check for security issues
        const securityIssues = [];
        
        // Check for open ports that might indicate vulnerabilities
        const riskyPorts = [21, 23, 25, 53, 137, 139, 445, 1433, 3306, 3389];
        if (device.openPorts) {
            const openRiskyPorts = device.openPorts.filter(port => riskyPorts.includes(port));
            if (openRiskyPorts.length > 0) {
                securityIssues.push(`Open risky ports: ${openRiskyPorts.join(', ')}`);
            }
        }

        // Check OS for known vulnerabilities
        if (device.os && device.os.toLowerCase().includes('windows xp')) {
            securityIssues.push('Outdated operating system');
        }

        // Check for default credentials in services
        if (device.serviceInfo) {
            const defaultCredentialServices = device.serviceInfo.filter(
                service => service.name && service.name.toLowerCase().includes('telnet')
            );
            if (defaultCredentialServices.length > 0) {
                securityIssues.push('Services with potential default credentials detected');
            }
        }

        // Determine status based on security issues
        if (securityIssues.length === 0) {
            return 'Secured';
        } else if (securityIssues.length === 1) {
            return 'Attention';
        } else {
            return 'Warning';
        }
    }

    calculateSecurityScore(device) {
        let score = 100;
        
        // Deduct points for security issues
        if (device.openPorts && device.openPorts.length > 0) {
            score -= device.openPorts.length * 5; // -5 points per open port
        }
        
        if (device.status === 'Warning') {
            score -= 30;
        } else if (device.status === 'Attention') {
            score -= 15;
        }
        
        // Ensure score stays within 0-100 range
        return Math.max(0, Math.min(100, score));
    }

    countNewDevices(devices) {
        return devices.filter(device => {
            const existingDevice = this.devices.get(device.id);
            return !existingDevice || existingDevice.lastSeen !== device.lastSeen;
        }).length;
    }

    calculateNetworkStats() {
        const devices = Array.from(this.devices.values());
        console.log('Calculating stats for devices:', devices);
        
        const stats = {
            totalDevices: devices.length,
            activeDevices: devices.filter(d => d.status === 'Secured' || d.status === 'Attention').length,
            vulnerableDevices: devices.filter(d => d.status === 'Warning').length,
            activeThreats: devices.filter(d => d.status === 'Warning').length,
            deviceTypes: this.categorizeDevices(devices),
            networkHealth: 'Good',
            networkLoad: this.calculateNetworkLoad(devices),
            bandwidthUsage: this.calculateBandwidthUsage(devices),
            lastScan: this.detector.lastScanTime?.toISOString() || new Date().toISOString()
        };

        // Determine network health
        if (stats.vulnerableDevices > 0) {
            stats.networkHealth = stats.vulnerableDevices > 2 ? 'Critical' : 'Warning';
        }

        console.log('Calculated stats:', stats);
        return stats;
    }

    categorizeDevices(devices) {
        const categories = {};
        devices.forEach(device => {
            const type = device.type || 'Unknown';
            categories[type] = (categories[type] || 0) + 1;
        });
        return categories;
    }

    calculateNetworkLoad(devices) {
        let totalLoad = 0;
        devices.forEach(device => {
            // Calculate load based on device type and activity
            let deviceLoad = 5; // Base load
            
            if (device.openPorts && device.openPorts.length > 0) {
                deviceLoad += device.openPorts.length * 2;
            }
            
            if (device.type) {
                switch(device.type.toLowerCase()) {
                    case 'camera':
                    case 'surveillance':
                        deviceLoad += 15;
                        break;
                    case 'smarthub':
                    case 'gateway':
                        deviceLoad += 10;
                        break;
                    case 'smartphone':
                    case 'computer':
                        deviceLoad += 8;
                        break;
                }
            }
            
            totalLoad += deviceLoad;
        });
        
        // Cap at 100% and format
        return Math.min(100, totalLoad) + '%';
    }

    calculateBandwidthUsage(devices) {
        let totalBandwidth = 0;
        devices.forEach(device => {
            // Estimate bandwidth based on device type and activity
            let deviceBandwidth = 0.1; // Base bandwidth in Mbps
            
            if (device.type) {
                switch(device.type.toLowerCase()) {
                    case 'camera':
                    case 'surveillance':
                        deviceBandwidth += 2.0;
                        break;
                    case 'smarthub':
                    case 'gateway':
                        deviceBandwidth += 1.0;
                        break;
                    case 'smartphone':
                    case 'computer':
                        deviceBandwidth += 0.5;
                        break;
                }
            }
            
            if (device.openPorts && device.openPorts.length > 0) {
                deviceBandwidth += device.openPorts.length * 0.1;
            }
            
            totalBandwidth += deviceBandwidth;
        });
        
        return {
            current: parseFloat(totalBandwidth.toFixed(1)),
            limit: 100,
            unit: 'Mbps'
        };
    }

    getDevices() {
        return Array.from(this.devices.values());
    }

    getDevice(id) {
        return this.devices.get(id);
    }

    getStats() {
        return this.calculateNetworkStats();
    }

    async assessDeviceVulnerabilities(device) {
        const vulnerabilities = [];
        const deviceId = device.id || device.mac || device.ip;

        try {
            // Check for default credentials
            if (device.metadata?.defaultCredentials) {
                vulnerabilities.push({
                    id: `${deviceId}-default-creds`,
                    device: device.name,
                    type: 'Default Credentials',
                    severity: 'High',
                    description: 'Device is using default manufacturer credentials',
                    recommendation: 'Change default credentials to strong, unique ones'
                });
            }

            // Check for open ports
            if (device.metadata?.openPorts?.length > 0) {
                const sensitiveOpenPorts = device.metadata.openPorts.filter(port => 
                    ['21', '22', '23', '25', '80', '443', '8080', '8443'].includes(port)
                );
                
                if (sensitiveOpenPorts.length > 0) {
                    vulnerabilities.push({
                        id: `${deviceId}-open-ports`,
                        device: device.name,
                        type: 'Open Ports',
                        severity: 'Medium',
                        description: `Sensitive ports exposed: ${sensitiveOpenPorts.join(', ')}`,
                        recommendation: 'Close unnecessary ports and restrict access to required ones'
                    });
                }
            }

            // Check firmware version
            if (device.metadata?.firmwareVersion && device.metadata?.latestFirmware && 
                device.metadata.firmwareVersion !== device.metadata.latestFirmware) {
                vulnerabilities.push({
                    id: `${deviceId}-firmware`,
                    device: device.name,
                    type: 'Outdated Firmware',
                    severity: 'Medium',
                    description: `Current version: ${device.metadata.firmwareVersion}, Latest: ${device.metadata.latestFirmware}`,
                    recommendation: 'Update device firmware to the latest version'
                });
            }

            // Check encryption
            if (device.metadata?.encryption === 'none' || device.metadata?.encryption === 'weak') {
                vulnerabilities.push({
                    id: `${deviceId}-encryption`,
                    device: device.name,
                    type: 'Weak Encryption',
                    severity: 'High',
                    description: 'Device is using weak or no encryption',
                    recommendation: 'Enable strong encryption (WPA3 for WiFi devices)'
                });
            }

            // Check for known vulnerabilities
            if (device.metadata?.knownVulnerabilities?.length > 0) {
                device.metadata.knownVulnerabilities.forEach(vuln => {
                    vulnerabilities.push({
                        id: `${deviceId}-vuln-${vuln.id}`,
                        device: device.name,
                        type: 'Known Vulnerability',
                        severity: vuln.severity || 'High',
                        description: vuln.description,
                        recommendation: vuln.recommendation || 'Apply security patches'
                    });
                });
            }

            // Emit security incident for high severity vulnerabilities
            vulnerabilities.filter(v => v.severity === 'High').forEach(vuln => {
                this.emit('securityIncident', {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    device: device.name,
                    type: vuln.type,
                    description: vuln.description,
                    status: 'Active',
                    timestamp: new Date().toISOString()
                });
            });

        } catch (error) {
            console.error(`Error assessing vulnerabilities for device ${device.name}:`, error);
        }

        return vulnerabilities;
    }

    async performNetworkScan() {
        try {
            // Emit scan start event
            this.emit('scanStart');
            
            // Get network information
            const networkInfo = await this.detector.getNetworkInfo();
            
            // Calculate progress steps
            const totalSteps = 3; // Network info, Device scan, Analysis
            let currentStep = 0;
            
            // Emit progress update
            this.emit('scanProgress', {
                progress: Math.round((++currentStep / totalSteps) * 100),
                status: 'Getting network information'
            });
            
            // Start the network scan
            const devices = await this.detector.startScan({
                networkInfo,
                progressCallback: (progress) => {
                    this.emit('scanProgress', {
                        progress: Math.round(((currentStep + progress/100) / totalSteps) * 100),
                        status: 'Scanning for devices'
                    });
                }
            });
            
            // Process discovered devices
            this.emit('scanProgress', {
                progress: Math.round((++currentStep / totalSteps) * 100),
                status: 'Processing discovered devices'
            });
            
            // Enhance scan results with device identification
            const enhancedDevices = await this.processDevices(devices);
            
            // Update network information with discovered devices
            networkInfo.totalDevices = enhancedDevices.length;
            
            // Emit scan completion with results
            this.emit('scanComplete', {
                devices: enhancedDevices,
                networkInfo: {
                    subnet: networkInfo.subnet,
                    gateway: networkInfo.gateway,
                    range: networkInfo.range,
                    totalDevices: networkInfo.totalDevices
                }
            });
            
            return {
                success: true,
                devices: enhancedDevices,
                networkInfo
            };
        } catch (error) {
            console.error('Network scan error:', error);
            this.emit('scanError', {
                message: error.message
            });
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = IoTAgent; 