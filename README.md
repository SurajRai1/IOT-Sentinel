# IoT Sentinel - Smart Home Security Dashboard 🛡️

IoT Sentinel is a comprehensive web application designed to monitor, secure, and manage IoT devices in your home network. Built with modern technologies, it provides real-time security monitoring and device management capabilities.

## 🚀 Features

### 1. Network Discovery & Monitoring
- Automatic device discovery and identification
- Real-time network monitoring
- Device categorization and classification
- Network topology visualization

### 2. Security Features
- Real-time vulnerability scanning
- Security score for each device
- Threat detection and alerts
- Firmware version monitoring
- Open port detection
- Default credential checking

### 3. Device Management
- Detailed device information
- Device status monitoring
- Manufacturer and model identification
- Connection history tracking
- Bandwidth usage monitoring

### 4. Security Dashboard
- Overall network security score
- Active threat monitoring
- Security recommendations
- Device vulnerability reports
- Historical security data

### 5. User Features
- Secure authentication with email/password and Google OAuth
- User profile management
- Customizable notification settings
- Role-based access control
- Two-factor authentication support

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express
- **Real-time Updates**: Socket.IO
- **Authentication & Database**: Supabase
- **Network Scanning**: nmap, node-nmap

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/SurajRai1/IOT-Sentinel.git
cd IOT-Sentinel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

## 📱 Usage

1. **Sign Up/Login**: Create an account or login using email or Google authentication
2. **Network Discovery**: Click "Scan Network" to discover IoT devices
3. **Monitor Devices**: View detailed information about each device
4. **Security Monitoring**: Check security scores and vulnerabilities
5. **Manage Settings**: Customize notification and security preferences

## 🔐 Security Features

- Row Level Security (RLS) for data protection
- Secure credential management
- Network scanning permission controls
- Real-time threat detection
- Encrypted data transmission
- Regular security audits

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Suraj Rai**
- GitHub: [@SurajRai1](https://github.com/SurajRai1)

## 🙏 Acknowledgments

- Thanks to all contributors and users of IoT Sentinel
- Built with support from the open-source community
- Special thanks to Supabase for authentication and database services 