const nmap = require('node-nmap');
const network = require('network');
const EventEmitter = require('events');
const { lookupVendor } = require('../data/macVendors');

class DeviceDetector extends EventEmitter {
    constructor() {
        super();
        this.isScanning = false;
        this.lastScanTime = null;
        this.scanInterval = null;
        this.scanTimeout = null;
        this.currentScan = null;
    }

    resetScanState() {
        console.log('Resetting scan state');
        this.isScanning = false;
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }
        if (this.currentScan) {
            try {
                this.currentScan.cancelScan();
            } catch (error) {
                console.error('Error cancelling scan:', error);
            }
            this.currentScan = null;
        }
    }

    async getLocalNetwork() {
        return new Promise((resolve, reject) => {
            network.get_private_ip((err, ip) => {
                if (err) {
                    reject(new Error('Failed to get local network IP: ' + err.message));
                    return;
                }
                // Get network interface details to determine subnet
                network.get_interfaces_list((err, interfaces) => {
                    if (err) {
                        console.error('Failed to get network interfaces:', err);
                        // Fallback to basic network range
                        resolve(`${ip}/24`);
                        return;
                    }

                    // Find the active interface
                    const activeInterface = interfaces.find(iface => 
                        iface.ip_address === ip && iface.type !== 'VirtualBox' && iface.type !== 'VMware'
                    );

                    if (activeInterface && activeInterface.netmask) {
                        // Calculate network range based on IP and netmask
                        const networkRange = this.calculateNetworkRange(ip, activeInterface.netmask);
                        console.log('Calculated network range:', networkRange);
                        resolve(networkRange);
                    } else {
                        // Fallback to basic network range
                        console.log('Using fallback network range for:', ip);
                        resolve(`${ip}/24`);
                    }
                });
            });
        });
    }

    calculateNetworkRange(ip, netmask) {
        // Convert IP and netmask to binary
        const ipBinary = ip.split('.').map(octet => parseInt(octet))
            .map(octet => octet.toString(2).padStart(8, '0')).join('');
        const maskBinary = netmask.split('.').map(octet => parseInt(octet))
            .map(octet => octet.toString(2).padStart(8, '0')).join('');

        // Calculate network address
        const networkBinary = ipBinary.split('').map((bit, index) => 
            bit & maskBinary[index]).join('');

        // Convert back to decimal
        const network = this.binaryToIp(networkBinary);
        
        // Calculate CIDR prefix length
        const prefixLength = maskBinary.split('1').length - 1;

        // Return in CIDR notation
        return `${network}/${prefixLength}`;
    }

    binaryToIp(binary) {
        return binary.match(/.{8}/g)
            .map(octet => parseInt(octet, 2))
            .join('.');
    }

    async startScan(options = {}) {
        // Check if scan is already in progress
        const scanDuration = Date.now() - (this.lastScanTime?.getTime() || 0);
        if (this.isScanning) {
            if (scanDuration > 60000) {
                console.log('Forcing scan reset due to timeout');
                this.resetScanState();
            } else {
                console.log('Scan in progress, duration:', scanDuration, 'ms');
                throw new Error('Scan already in progress');
            }
        }

        try {
            this.isScanning = true;
            this.lastScanTime = new Date();
            this.emit('scanStart');

            const networkRange = await this.getLocalNetwork();
            console.log('Network range:', networkRange);

            return new Promise((resolve, reject) => {
                try {
                    console.log('Starting network scan...');
                    
                    const scanOptions = [
                        '-sn',              // Ping scan - just detect if host is up
                        '-PR',              // ARP scan
                        '--max-retries 1',  // Limit retries for faster scanning
                        '--host-timeout 10s', // Timeout per host
                        '--min-rate 300'    // Minimum packet rate
                    ].join(' ');

                    this.currentScan = new nmap.NmapScan(networkRange, scanOptions);

                    let isCompleted = false;
                    let isFallbackInProgress = false;

                    this.scanTimeout = setTimeout(() => {
                        if (!isCompleted && !isFallbackInProgress) {
                            console.log('Scan timeout reached, attempting fallback');
                            isFallbackInProgress = true;
                            if (this.currentScan) {
                                try {
                                    this.currentScan.cancelScan();
                                } catch (error) {
                                    console.error('Error cancelling scan:', error);
                                }
                            }
                            this.resetScanState();
                            this.performFallbackScan(networkRange)
                                .then(resolve)
                                .catch(reject);
                        }
                    }, 30000);

                    this.currentScan.on('complete', async (data) => {
                        if (!isCompleted && !isFallbackInProgress) {
                            isCompleted = true;
                            console.log('Scan complete, found', data.length, 'devices');
                            clearTimeout(this.scanTimeout);
                            this.scanTimeout = null;
                            
                            try {
                                const enhancedData = await this.enhanceScanResults(data);
                                console.log('Scan completed successfully, enhanced', enhancedData.length, 'devices');
                                this.resetScanState();
                                this.emit('scanComplete', enhancedData);
                                resolve(enhancedData);
                            } catch (error) {
                                console.error('Error enhancing scan results:', error);
                                this.resetScanState();
                                reject(error);
                            }
                        }
                    });

                    this.currentScan.on('error', (error) => {
                        if (!isCompleted && !isFallbackInProgress) {
                            console.error('Primary scan failed:', error);
                            clearTimeout(this.scanTimeout);
                            this.scanTimeout = null;
                            isFallbackInProgress = true;
                            this.resetScanState();
                            
                            // Try fallback scan
                            this.performFallbackScan(networkRange)
                                .then(resolve)
                                .catch(reject);
                        }
                    });

                    this.currentScan.startScan();
                } catch (error) {
                    console.error('Scan initialization failed:', error);
                    this.resetScanState();
                    reject(new Error('Failed to initialize scan: ' + error.message));
                }
            });
        } catch (error) {
            console.error('Scan setup failed:', error);
            this.resetScanState();
            throw error;
        }
    }

    async performFallbackScan(networkRange) {
        if (this.isScanning) {
            console.log('Fallback scan already in progress');
            throw new Error('Scan already in progress');
        }

        console.log('Starting fallback scan for range:', networkRange);
        return new Promise((resolve, reject) => {
            try {
                this.isScanning = true;
                const basicScan = new nmap.NmapScan(networkRange, '-sn -PR');

                this.currentScan = basicScan;
                let isCompleted = false;

                this.scanTimeout = setTimeout(() => {
                    if (!isCompleted) {
                        console.log('Fallback scan timeout reached');
                        this.resetScanState();
                        reject(new Error('Fallback scan timeout'));
                    }
                }, 15000);

                basicScan.on('complete', async (data) => {
                    if (!isCompleted) {
                        isCompleted = true;
                        console.log('Fallback scan complete, found', data.length, 'devices');
                        clearTimeout(this.scanTimeout);
                        this.scanTimeout = null;

                        try {
                            const enhancedData = data.map(device => {
                                return {
                                    ip: device.ip || '',
                                    mac: device.mac || '',
                                    hostname: device.hostname || '',
                                    openPorts: [],
                                    os: '',
                                    vendor: ''
                                };
                            });
                            
                            console.log('Fallback scan successful, processed', enhancedData.length, 'devices');
                            this.resetScanState();
                            this.emit('scanComplete', enhancedData);
                            resolve(enhancedData);
                        } catch (error) {
                            console.error('Error processing fallback results:', error);
                            this.resetScanState();
                            reject(error);
                        }
                    }
                });

                basicScan.on('error', (error) => {
                    if (!isCompleted) {
                        isCompleted = true;
                        console.error('Fallback scan failed:', error);
                        clearTimeout(this.scanTimeout);
                        this.scanTimeout = null;
                        this.resetScanState();
                        reject(error);
                    }
                });

                basicScan.startScan();
            } catch (error) {
                console.error('Fallback scan initialization failed:', error);
                this.resetScanState();
                reject(error);
            }
        });
    }

    async enhanceScanResults(data) {
        console.log('Enhancing scan results for', data.length, 'devices');
        return Promise.all(data.map(async device => {
            try {
                // Basic device info
                const enhancedDevice = {
                    ip: device.ip || '',
                    mac: device.mac || '',
                    hostname: device.hostname || '',
                    openPorts: device.openPorts || [],
                    os: device.osNmap || device.os || '',
                    vendor: device.vendor || '',
                    status: device.status || 'unknown'
                };

                // Try to determine device type and name
                const deviceInfo = this.identifyDevice(enhancedDevice);
                enhancedDevice.type = deviceInfo.type;
                enhancedDevice.name = deviceInfo.name;

                console.log('Enhanced device:', enhancedDevice);
                return enhancedDevice;
            } catch (error) {
                console.error(`Error enhancing device ${device.ip}:`, error);
                return device;
            }
        }));
    }

    identifyDevice(device) {
        let type = 'Unknown Device';
        let name = device.hostname || '';

        // Check MAC vendor first
        if (device.mac) {
            const vendorInfo = lookupVendor(device.mac);
            if (vendorInfo.type !== 'Unknown Device') {
                type = vendorInfo.type;
                if (!name) {
                    name = `${vendorInfo.name} Device`;
                }
            }
        }

        // Check hostname patterns if we still don't have a type
        const hostname = (device.hostname || '').toLowerCase();
        if (hostname && type === 'Unknown Device') {
            // Mobile devices
            if (hostname.includes('iphone') || hostname.includes('ipad')) {
                type = 'iOS Device';
            } else if (hostname.includes('android')) {
                type = 'Android Device';
            }
            // Computers
            else if (hostname.includes('macbook') || hostname.includes('imac')) {
                type = 'Mac Device';
            } else if (hostname.includes('pc') || hostname.includes('desktop') || hostname.includes('laptop')) {
                type = 'Windows PC';
            }
            // Network devices
            else if (hostname.includes('router') || hostname.includes('gateway')) {
                type = 'Router';
            } else if (hostname.includes('ap') || hostname.includes('wifi') || hostname.includes('wireless')) {
                type = 'WiFi Device';
            }
        }

        // Generate a friendly name if none available
        if (!name) {
            if (type !== 'Unknown Device') {
                name = `${type} (${device.ip.split('.').pop()})`;
            } else {
                name = `Device (${device.ip.split('.').pop()})`;
            }
        }

        return { type, name };
    }

    startPeriodicScan(interval = 300000, options = {}) {
        this.stopPeriodicScan(); // Clean up any existing periodic scan

        // Perform initial scan
        this.startScan(options).catch(error => {
            console.error('Periodic scan error:', error);
            this.emit('error', error);
        });

        // Set up periodic scanning
        this.scanInterval = setInterval(() => {
            if (!this.isScanning) {
                this.startScan(options).catch(error => {
                    console.error('Periodic scan error:', error);
                    this.emit('error', error);
                });
            } else {
                console.log('Skipping periodic scan - previous scan still in progress');
            }
        }, interval);
    }

    stopPeriodicScan() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.resetScanState();
    }

    getScanStatus() {
        return {
            isScanning: this.isScanning,
            lastScanTime: this.lastScanTime,
            scanDuration: this.lastScanTime ? Date.now() - this.lastScanTime.getTime() : null
        };
    }

    async getNetworkInfo() {
        return new Promise((resolve, reject) => {
            const network = require('network');
            
            network.get_active_interface((err, networkInterface) => {
                if (err) {
                    reject(new Error('Failed to get network interface information'));
                    return;
                }

                if (!networkInterface) {
                    reject(new Error('No active network interface found'));
                    return;
                }

                // Extract network information
                const networkInfo = {
                    interface: networkInterface.name,
                    ip: networkInterface.ip_address,
                    gateway: networkInterface.gateway_ip,
                    subnet: networkInterface.netmask,
                    mac: networkInterface.mac_address,
                    type: networkInterface.type,
                    range: this.calculateNetworkRange(networkInterface.ip_address, networkInterface.netmask)
                };

                resolve(networkInfo);
            });
        });
    }
}

module.exports = DeviceDetector; 