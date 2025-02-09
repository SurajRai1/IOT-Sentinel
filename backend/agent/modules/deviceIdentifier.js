const { lookupVendor } = require('../data/macVendors');

class DeviceIdentifier {
    constructor() {
        // Common IoT device ports and their associated services
        this.portSignatures = {
            80: ['HTTP', 'Web Interface'],
            443: ['HTTPS', 'Secure Web Interface'],
            554: ['RTSP', 'Camera Stream'],
            1883: ['MQTT', 'IoT Communication'],
            8883: ['MQTT/SSL', 'Secure IoT Communication'],
            5353: ['mDNS', 'Device Discovery'],
            8080: ['HTTP Alt', 'Web Interface'],
            2323: ['Telnet', 'Device Control'],
            49152: ['UPnP', 'Device Discovery']
        };

        // Known device models and their identifiers
        this.deviceModels = {
            // Smartphones
            'iPhone': {
                identifiers: ['iphone', 'apple'],
                models: {
                    'iPhone11,2': 'iPhone XS',
                    'iPhone12,1': 'iPhone 11',
                    'iPhone13,1': 'iPhone 12 mini',
                    'iPhone13,2': 'iPhone 12',
                    'iPhone14,2': 'iPhone 13 Pro'
                }
            },
            'Samsung': {
                identifiers: ['samsung', 'galaxy'],
                models: {
                    'SM-G': 'Galaxy S Series',
                    'SM-N': 'Galaxy Note Series',
                    'SM-A': 'Galaxy A Series'
                }
            },
            // Smart Home Devices
            'Philips Hue': {
                identifiers: ['philips', 'hue'],
                models: {
                    'BSB': 'Hue Bridge',
                    'LCT': 'Hue Color Bulb',
                    'LWB': 'Hue White Bulb'
                }
            },
            'Ring': {
                identifiers: ['ring'],
                models: {
                    'Doorbell': 'Video Doorbell',
                    'Cam': 'Security Camera'
                }
            }
        };

        // Device type signatures based on open ports and services
        this.deviceSignatures = {
            router: {
                ports: [53, 80, 443, 67, 68],
                services: ['router', 'gateway', 'dns', 'dhcp']
            },
            camera: {
                ports: [554, 80, 443, 8080],
                services: ['rtsp', 'streaming', 'camera']
            },
            smartphone: {
                ports: [62078, 49152, 5353],
                services: ['apple-mobile', 'android', 'mobile']
            },
            computer: {
                ports: [135, 139, 445, 3389],
                services: ['microsoft-ds', 'netbios', 'rdp']
            },
            smartHub: {
                ports: [8080, 8443, 1883, 8883],
                services: ['mqtt', 'hub', 'zigbee', 'zwave']
            },
            printer: {
                ports: [515, 631, 9100],
                services: ['printer', 'ipp', 'jetdirect']
            }
        };
    }

    async identifyDevice(device) {
        try {
            console.log('Identifying device:', device);
            
            // Basic device info
            const enrichedDevice = {
                ...device,
                id: device.mac || device.ip,
                name: this.generateDeviceName(device),
                type: this.determineDeviceType(device),
                manufacturer: this.getManufacturer(device),
                model: this.determineModel(device),
                firmwareVersion: this.extractFirmwareVersion(device),
                lastSeen: new Date().toISOString(),
                securityScore: this.calculateSecurityScore(device)
            };

            // Additional device details
            enrichedDevice.details = {
                mac: device.mac || 'Unknown',
                ipAddress: device.ip,
                hostname: device.hostname || 'Unknown',
                openPorts: device.openPorts || [],
                os: device.os || 'Unknown',
                services: device.services || [],
                lastSeen: new Date().toISOString(),
                firstSeen: device.firstSeen || new Date().toISOString(),
                manufacturer: enrichedDevice.manufacturer,
                model: enrichedDevice.model,
                firmwareVersion: enrichedDevice.firmwareVersion,
                capabilities: this.determineCapabilities(device)
            };

            return enrichedDevice;
        } catch (error) {
            console.error('Error identifying device:', error);
            return device;
        }
    }

    getManufacturer(device) {
        if (!device.mac) return 'Unknown';
        
        const vendor = lookupVendor(device.mac);
        if (vendor.name !== 'Unknown') return vendor.name;

        // Try to determine manufacturer from hostname or OS
        const hostname = (device.hostname || '').toLowerCase();
        const os = (device.os || '').toLowerCase();

        if (os.includes('apple') || hostname.includes('iphone') || hostname.includes('ipad')) {
            return 'Apple';
        }
        if (os.includes('android') || hostname.includes('android')) {
            if (hostname.includes('samsung')) return 'Samsung';
            if (hostname.includes('huawei')) return 'Huawei';
            if (hostname.includes('xiaomi')) return 'Xiaomi';
            return 'Android Device Manufacturer';
        }
        if (os.includes('windows')) return 'Microsoft';
        
        return 'Unknown';
    }

    determineModel(device) {
        const manufacturer = this.getManufacturer(device);
        const hostname = (device.hostname || '').toLowerCase();
        const os = (device.os || '').toLowerCase();

        // Check device models database
        for (const [brand, info] of Object.entries(this.deviceModels)) {
            if (info.identifiers.some(id => 
                hostname.includes(id) || 
                os.includes(id) || 
                (manufacturer && manufacturer.toLowerCase().includes(id))
            )) {
                // Check specific model identifiers
                for (const [modelId, modelName] of Object.entries(info.models)) {
                    if (hostname.includes(modelId.toLowerCase())) {
                        return modelName;
                    }
                }
                // Return generic model if specific not found
                return brand + ' Device';
            }
        }

        // Extract model from hostname patterns
        const modelPatterns = [
            /model[:\s-_]+([a-z0-9-_]+)/i,
            /([a-z0-9]{3,4}-[a-z0-9]{3,4})/i,
            /([a-z]{2,4}[0-9]{2,4})/i
        ];

        for (const pattern of modelPatterns) {
            const match = hostname.match(pattern);
            if (match) return match[1].toUpperCase();
        }

        return 'Unknown Model';
    }

    extractFirmwareVersion(device) {
        if (device.services) {
            for (const service of device.services) {
                if (service.version) {
                    return service.version;
                }
            }
        }

        // Try to extract version from OS or hostname
        const versionPatterns = [
            /fw[:\s-_]+([0-9.]+)/i,
            /firmware[:\s-_]+([0-9.]+)/i,
            /v([0-9.]+)/i
        ];

        const textToSearch = [
            device.os || '',
            device.hostname || '',
            ...(device.services || []).map(s => s.name || '')
        ].join(' ').toLowerCase();

        for (const pattern of versionPatterns) {
            const match = textToSearch.match(pattern);
            if (match) return match[1];
        }

        return 'Unknown';
    }

    determineCapabilities(device) {
        const capabilities = new Set();

        // Check open ports for capabilities
        if (device.openPorts) {
            device.openPorts.forEach(port => {
                if (this.portSignatures[port]) {
                    capabilities.add(this.portSignatures[port][1]);
                }
            });
        }

        // Check services for capabilities
        if (device.services) {
            device.services.forEach(service => {
                if (service.name) {
                    if (service.name.includes('rtsp')) capabilities.add('Video Streaming');
                    if (service.name.includes('mqtt')) capabilities.add('IoT Communication');
                    if (service.name.includes('http')) capabilities.add('Web Interface');
                    if (service.name.includes('ssh')) capabilities.add('Remote Access');
                }
            });
        }

        // Add basic capabilities based on device type
        const type = this.determineDeviceType(device);
        switch (type.toLowerCase()) {
            case 'camera':
                capabilities.add('Video Capture');
                capabilities.add('Motion Detection');
                break;
            case 'smartphone':
                capabilities.add('Mobile Device');
                capabilities.add('Wi-Fi');
                capabilities.add('Bluetooth');
                break;
            case 'router':
                capabilities.add('Network Management');
                capabilities.add('DHCP Server');
                capabilities.add('Firewall');
                break;
        }

        return Array.from(capabilities);
    }

    determineDeviceType(device) {
        let type = 'Unknown Device';
        
        // Check manufacturer first
        const manufacturer = this.getManufacturer(device);
        if (manufacturer && typeof manufacturer === 'string') {
            const mfg = manufacturer.toLowerCase();
            
            // Network devices
            if (mfg.includes('cisco') || mfg.includes('netgear') || mfg.includes('d-link') || 
                mfg.includes('tp-link') || mfg.includes('asus') || mfg.includes('linksys')) {
                if (device.openPorts?.includes(80) || device.openPorts?.includes(443)) {
                    type = 'Router';
                } else {
                    type = 'Network Device';
                }
            }
            
            // IoT devices
            else if (mfg.includes('nest') || mfg.includes('ring') || mfg.includes('philips hue') || 
                     mfg.includes('samsung smartthings') || mfg.includes('xiaomi')) {
                type = 'IoT Device';
            }
            
            // Security cameras
            else if (mfg.includes('hikvision') || mfg.includes('dahua') || mfg.includes('axis') || 
                     mfg.includes('lorex') || mfg.includes('reolink')) {
                type = 'Security Camera';
            }
            
            // Smart TVs
            else if (mfg.includes('samsung') || mfg.includes('lg') || mfg.includes('vizio') || 
                     mfg.includes('sony') || mfg.includes('tcl')) {
                type = 'Smart TV';
            }
            
            // Gaming consoles
            else if (mfg.includes('nintendo') || mfg.includes('sony') || mfg.includes('microsoft')) {
                type = 'Gaming Console';
            }
        }
        
        // If type is still unknown, try to determine from hostname and ports
        if (type === 'Unknown Device') {
            type = this.guessDeviceTypeFromPorts(device.openPorts || []);
        }
        
        return type;
    }

    guessDeviceTypeFromPorts(ports) {
        const portNumbers = ports.map(p => parseInt(p));
        
        // Common port combinations
        if (portNumbers.includes(80) && portNumbers.includes(443)) {
            return 'Network Device';
        }
        if (portNumbers.includes(8080) || portNumbers.includes(554)) {
            return 'Security Camera';
        }
        if (portNumbers.includes(515) || portNumbers.includes(631)) {
            return 'Printer';
        }
        if (portNumbers.includes(1883) || portNumbers.includes(8883)) {
            return 'Smart Hub';
        }
        
        return 'Network Device';
    }

    generateDeviceName(device) {
        console.log('Generating name for device:', device);
        const manufacturer = this.getManufacturer(device);
        const type = this.determineDeviceType(device);
        
        // Use hostname if available and valid
        if (device.hostname && device.hostname !== '') {
            // Clean up hostname
            let cleanHostname = device.hostname
                .replace(/[^a-zA-Z0-9-_\s]/g, '')
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            
            // If hostname is just an IP or MAC, don't use it
            if (cleanHostname.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)) {
                cleanHostname = '';
            }
            if (cleanHostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
                cleanHostname = '';
            }
            
            if (cleanHostname) {
                return cleanHostname;
            }
        }

        // Generate a friendly name based on manufacturer and type
        const id = device.mac ? 
            device.mac.replace(/:/g, '').slice(-4) : 
            device.ip.split('.').pop();

        if (manufacturer !== 'Unknown') {
            return `${manufacturer} ${type} (${id})`;
        }

        return `${type} (${id})`;
    }

    calculateSecurityScore(device) {
        // Default score starts at 100
        let score = 100;
        const securityIssues = [];

        // Check for open telnet ports
        if (device.openPorts?.includes(23) || device.openPorts?.includes(2323)) {
            score -= 30;
            securityIssues.push('Open Telnet port detected');
        }

        // Check for open FTP ports
        if (device.openPorts?.includes(21)) {
            score -= 20;
            securityIssues.push('Open FTP port detected');
        }

        // Check for default/common ports
        const commonPorts = [80, 443, 8080, 8443];
        if (device.openPorts?.some(port => commonPorts.includes(port))) {
            score -= 10;
            securityIssues.push('Common web ports exposed');
        }

        // Check for manufacturer
        if (!device.manufacturer || device.manufacturer === 'Unknown') {
            score -= 5;
            securityIssues.push('Unknown manufacturer');
        }

        // Check for firmware version
        if (!device.firmwareVersion || device.firmwareVersion === 'Unknown') {
            score -= 5;
            securityIssues.push('Unknown firmware version');
        }

        // Ensure score doesn't go below 0
        return Math.max(0, score);
    }
}

module.exports = DeviceIdentifier; 