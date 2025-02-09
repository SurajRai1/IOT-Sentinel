// Common IoT device manufacturers and their MAC address prefixes
const macVendors = {
    // Apple Devices
    '00:17:AB': { name: 'Apple', type: 'Mac Device' },
    '28:6A:BA': { name: 'Apple', type: 'Mac Device' },
    '00:1C:B3': { name: 'Apple', type: 'iOS Device' },
    'AC:BC:32': { name: 'Apple', type: 'iOS Device' },
    'F0:18:98': { name: 'Apple', type: 'iOS Device' },
    '34:C0:59': { name: 'Apple', type: 'iOS Device' },
    
    // Mobile Devices - Samsung
    '00:26:37': { name: 'Samsung', type: 'Android Device' },
    '94:35:0A': { name: 'Samsung', type: 'Android Device' },
    '8C:71:F8': { name: 'Samsung', type: 'Android Device' },
    'B4:3A:28': { name: 'Samsung', type: 'Android Device' },
    
    // Mobile Devices - Xiaomi & POCO
    '00:24:E4': { name: 'Xiaomi', type: 'Android Device' },
    'F8:A4:5F': { name: 'Xiaomi', type: 'Android Device' },
    '58:44:98': { name: 'Xiaomi', type: 'Android Device' },
    '64:CC:2E': { name: 'POCO', type: 'Android Device' },
    '40:31:3C': { name: 'POCO', type: 'Android Device' },
    
    // Mobile Devices - OPPO & Realme
    'A4:3D:78': { name: 'OPPO', type: 'Android Device' },
    'E8:BB:A8': { name: 'OPPO', type: 'Android Device' },
    '94:D2:99': { name: 'Realme', type: 'Android Device' },
    '48:D5:39': { name: 'Realme', type: 'Android Device' },
    
    // Mobile Devices - OnePlus & Vivo
    'AC:5F:EA': { name: 'OnePlus', type: 'Android Device' },
    '94:65:2D': { name: 'OnePlus', type: 'Android Device' },
    'FC:1A:11': { name: 'Vivo', type: 'Android Device' },
    '70:47:E9': { name: 'Vivo', type: 'Android Device' },
    
    // Mobile Devices - Other Brands
    '00:23:75': { name: 'Motorola', type: 'Android Device' },
    '30:82:90': { name: 'Huawei', type: 'Android Device' },
    '70:72:3C': { name: 'Huawei', type: 'Android Device' },
    '00:37:6D': { name: 'LG', type: 'Android Device' },
    
    // Computer Manufacturers - Dell
    '00:14:22': { name: 'Dell', type: 'Windows PC' },
    '00:26:B9': { name: 'Dell', type: 'Windows PC' },
    'F8:DB:88': { name: 'Dell', type: 'Windows PC' },
    '18:A9:9B': { name: 'Dell', type: 'Windows PC' },
    
    // Computer Manufacturers - HP
    '00:21:5A': { name: 'HP', type: 'Windows PC' },
    '00:23:7D': { name: 'HP', type: 'Windows PC' },
    '94:57:A5': { name: 'HP', type: 'Windows PC' },
    '80:C1:6E': { name: 'HP', type: 'Windows PC' },
    
    // Computer Manufacturers - Lenovo
    '00:59:07': { name: 'Lenovo', type: 'Windows PC' },
    'E8:2A:44': { name: 'Lenovo', type: 'Windows PC' },
    '48:2D:01': { name: 'Lenovo', type: 'Windows PC' },
    
    // Computer Manufacturers - ASUS
    '00:1B:FC': { name: 'ASUS', type: 'Windows PC' },
    '04:92:26': { name: 'ASUS', type: 'Windows PC' },
    '30:85:A9': { name: 'ASUS', type: 'Windows PC' },
    
    // Computer Manufacturers - Acer
    '00:1C:26': { name: 'Acer', type: 'Windows PC' },
    '84:34:97': { name: 'Acer', type: 'Windows PC' },
    'E0:69:95': { name: 'Acer', type: 'Windows PC' },
    
    // Computer Manufacturers - Microsoft
    '00:15:5D': { name: 'Microsoft', type: 'Windows PC' },
    '28:18:78': { name: 'Microsoft', type: 'Windows PC' },
    'C8:F7:33': { name: 'Microsoft', type: 'Windows PC' },
    
    // IoT and Smart Home - Google
    'B8:27:EB': { name: 'Raspberry Pi', type: 'IoT Device' },
    'DC:A6:32': { name: 'Raspberry Pi', type: 'IoT Device' },
    '18:B4:30': { name: 'Nest', type: 'IoT Device' },
    'F4:F5:D8': { name: 'Google Home', type: 'IoT Device' },
    '00:1A:11': { name: 'Google Chromecast', type: 'IoT Device' },
    
    // IoT and Smart Home - Philips
    '00:17:88': { name: 'Philips Hue', type: 'IoT Device' },
    'B0:C5:54': { name: 'Samsung SmartThings', type: 'IoT Device' },
    
    // IoT and Smart Home - Amazon
    '74:C2:46': { name: 'Amazon', type: 'IoT Device' },
    'FC:65:DE': { name: 'Amazon Alexa', type: 'IoT Device' },
    '0C:47:C9': { name: 'Amazon Echo', type: 'IoT Device' },
    '68:54:FD': { name: 'Amazon Fire', type: 'IoT Device' },
    
    // IoT and Smart Home - Smart Appliances
    '00:0E:8F': { name: 'Xiaomi Smart Home', type: 'IoT Device' },
    '60:A4:23': { name: 'Samsung Smart TV', type: 'IoT Device' },
    '00:12:FB': { name: 'Samsung Smart Appliance', type: 'IoT Device' },
    '00:24:E4': { name: 'LG Smart TV', type: 'IoT Device' },
    
    // Network Equipment - Routers
    '00:50:BA': { name: 'D-Link Router', type: 'Router' },
    '28:10:7B': { name: 'D-Link Router', type: 'Router' },
    '00:25:86': { name: 'TP-Link Router', type: 'Router' },
    '00:1D:7E': { name: 'Cisco-Linksys Router', type: 'Router' },
    '00:18:F8': { name: 'Cisco-Linksys Router', type: 'Router' },
    'E8:48:B8': { name: 'Ubiquiti', type: 'WiFi Device' },
    'DC:9F:DB': { name: 'Ubiquiti', type: 'WiFi Device' },
    '00:14:6C': { name: 'Netgear Router', type: 'Router' },
    'C0:3F:0E': { name: 'Netgear Router', type: 'Router' },
    
    // Security Cameras and Surveillance
    '00:80:F0': { name: 'Panasonic Camera', type: 'Security Camera' },
    'C0:56:27': { name: 'Belkin Camera', type: 'Security Camera' },
    '00:0C:43': { name: 'Ralink Camera', type: 'Security Camera' },
    'B0:C5:54': { name: 'Hikvision Camera', type: 'Security Camera' },
    '28:57:BE': { name: 'Dahua Camera', type: 'Security Camera' },
    '00:18:AE': { name: 'Xiaomi Camera', type: 'Security Camera' },
    
    // Gaming Consoles
    '7C:BB:8A': { name: 'Nintendo Switch', type: 'Gaming Console' },
    '00:50:F2': { name: 'Microsoft Xbox', type: 'Gaming Console' },
    '00:D9:D1': { name: 'Sony PlayStation', type: 'Gaming Console' },
    '00:04:1F': { name: 'Sony PlayStation', type: 'Gaming Console' }
};

function lookupVendor(macAddress) {
    if (!macAddress) return { name: 'Unknown', type: 'Unknown Device' };
    
    // Convert to uppercase and standardize format
    const standardMac = macAddress.toUpperCase().replace(/[^A-F0-9]/g, '');
    
    // Check different prefix lengths (6, 7, 8 characters)
    const prefixes = [
        standardMac.slice(0, 6),
        standardMac.slice(0, 7),
        standardMac.slice(0, 8)
    ];
    
    // Format prefixes with colons
    const formattedPrefixes = prefixes.map(prefix => 
        prefix.match(/.{1,2}/g).join(':')
    );
    
    // Look for matching vendor
    for (const prefix of formattedPrefixes) {
        if (macVendors[prefix]) {
            return macVendors[prefix];
        }
    }
    
    return { name: 'Unknown', type: 'Unknown Device' };
}

module.exports = {
    lookupVendor,
    vendorList: macVendors
}; 