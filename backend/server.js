require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const IoTAgent = require('./agent');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Supabase client with retries
const initSupabase = (retries = 3) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  );
  return supabase;
};

// Initialize database
const initDatabase = async () => {
  try {
    const supabase = initSupabase();
    
    // Check if devices table exists
    const { data: existingTable, error: tableError } = await supabase
      .from('devices')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      console.log('Creating devices table...');
      // Create the devices table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_devices_table');
      if (createError) {
        console.error('Error creating devices table:', createError);
      }
    }
    
    return supabase;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Retry function for database operations
const retryOperation = async (operation, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }
  }
  throw lastError;
};

let supabase;

// Initialize database and start server
const startServer = async () => {
  try {
    supabase = await initDatabase();
    
    // Middleware
    app.use(cors());
    app.use(express.json());

    // Initialize IoT Agent
    const agent = new IoTAgent({
      scanInterval: parseInt(process.env.SCAN_INTERVAL) || 300000
    });

    // Handle agent events
    agent.on('scanStart', () => {
      io.emit('scanStart');
      console.log('Network scan started');
    });

    agent.on('devicesUpdate', async (data) => {
      io.emit('devicesUpdate', data);
      console.log('Devices updated:', data.devices.length, 'devices found');

      // Only store devices in Supabase if this is a full scan update
      if (!data.updateType || data.updateType === 'scan') {
        try {
          await retryOperation(async () => {
            const { error } = await supabase
              .from('devices')
              .upsert(
                data.devices.map(device => ({
                  id: device.id,
                  ip: device.ip,
                  mac: device.mac,
                  name: device.name,
                  type: device.type,
                  manufacturer: device.manufacturer,
                  model: device.model,
                  status: device.status,
                  security_score: device.securityScore,
                  last_seen: new Date().toISOString(),
                  metadata: {
                    openPorts: device.openPorts,
                    os: device.os,
                    services: device.services,
                    capabilities: device.capabilities
                  }
                }))
              );

            if (error) {
              throw error;
            }
          });
        } catch (error) {
          console.error('Error storing devices after retries:', error);
        }
      }
    });

    agent.on('deviceStatusChange', (data) => {
      io.emit('deviceStatusChange', data);
      console.log('Device status changed:', data);
    });

    agent.on('error', (error) => {
      console.error('Agent error:', error);
      io.emit('scanError', { message: error.message });
    });

    // Network monitoring interval (in milliseconds)
    const NETWORK_UPDATE_INTERVAL = 5000;

    io.on('connection', (socket) => {
      console.log('Client connected');
      
      let userId = null; // Store user ID for this connection

      // Handle authentication
      socket.on('authenticate', async (token) => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (error) throw error;
          userId = user.id;
          console.log('User authenticated:', userId);
        } catch (error) {
          console.error('Authentication error:', error);
        }
      });

      // Initialize network monitoring for this client
      let networkMonitoringInterval = setInterval(() => {
        // Get network statistics
        const networkUpdate = {
          incoming: Math.floor(Math.random() * 100), // Replace with actual network monitoring
          outgoing: Math.floor(Math.random() * 100)  // Replace with actual network monitoring
        };
        
        socket.emit('networkUpdate', networkUpdate);
      }, NETWORK_UPDATE_INTERVAL);

      // Monitor device activities
      agent.on('deviceActivity', (activity) => {
        socket.emit('deviceActivity', {
          device: activity.deviceName,
          activity: activity.type,
          dataUsage: activity.dataUsage,
          timestamp: new Date().toISOString()
        });
      });

      // Monitor network anomalies
      agent.on('anomalyDetected', (anomaly) => {
        socket.emit('networkAnomaly', {
          type: anomaly.type,
          severity: anomaly.severity,
          description: anomaly.description,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(networkMonitoringInterval);
      });

      // Send current devices and stats on connection
      const devices = agent.getDevices();
      const stats = agent.getStats();
      socket.emit('scanComplete', { devices, stats });

      // Handle scan request
      socket.on('requestScan', async () => {
        try {
          console.log('Starting vulnerability scan...');
          socket.emit('scanStart');
          
          // Trigger the scan
          const devices = await agent.scan();
          
          // Process vulnerabilities
          const vulnerabilities = [];
          for (const device of devices) {
            const deviceVulns = await agent.assessDeviceVulnerabilities(device);
            vulnerabilities.push(...deviceVulns);
          }
          
          // Store devices in Supabase with user_id
          if (userId) {
            try {
              await retryOperation(async () => {
                const { error } = await supabase
                  .from('devices')
                  .upsert(
                    devices.map(device => ({
                      id: device.id,
                      ip: device.ip,
                      mac: device.mac,
                      name: device.name,
                      type: device.type,
                      manufacturer: device.manufacturer,
                      model: device.model,
                      status: device.status,
                      security_score: device.securityScore,
                      last_seen: new Date().toISOString(),
                      user_id: userId, // Add user_id to each device
                      metadata: {
                        openPorts: device.openPorts,
                        os: device.os,
                        services: device.services,
                        capabilities: device.capabilities
                      }
                    }))
                  );

                if (error) {
                  throw error;
                }
              });
            } catch (error) {
              console.error('Error storing devices after retries:', error);
            }
          }
          
          // Emit vulnerability update
          socket.emit('vulnerabilityUpdate', { vulnerabilities });
          
          // Calculate and emit updated stats
          const stats = agent.calculateNetworkStats();
          
          // Emit scan completion with both devices and stats
          socket.emit('scanComplete', { 
            devices: devices, 
            stats: stats 
          });
        } catch (error) {
          console.error('Scan error:', error);
          socket.emit('scanError', { message: error.message });
        }
      });

      // Handle network discovery request
      socket.on('requestNetworkScan', async () => {
        try {
          console.log('Starting network discovery scan...');
          
          // Perform network scan
          const result = await agent.performNetworkScan();
          
          console.log('Network scan complete:', result);
        } catch (error) {
          console.error('Network scan error:', error);
          socket.emit('scanError', { message: error.message });
        }
      });
    });

    // Start the agent
    console.log('Starting IoT agent...');
    await agent.start();

    // Cleanup function for graceful shutdown
    const cleanup = () => {
      console.log('Cleaning up...');
      if (agent) {
        agent.stop();
      }
      if (server) {
        server.close();
      }
      process.exit(0);
    };

    // Handle graceful shutdown
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer(); 