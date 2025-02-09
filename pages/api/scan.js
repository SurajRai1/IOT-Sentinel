export default function handler(req, res) {
  if (req.method === 'POST') {
    // Extract device data from the request body
    const deviceData = req.body;

    // Broadcast device data through Socket.IO if server is running
    if (res.socket.server.io) {
      res.socket.server.io.emit('new-device', deviceData);
      console.log('Broadcasting device data:', deviceData);
    } else {
      console.log('Socket.IO server not running');
    }
    res.status(200).json({ message: 'Device data broadcasted' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 