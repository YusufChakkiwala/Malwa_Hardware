require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocketService } = require('./services/socketService');

const port = Number(process.env.PORT) || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

initSocketService(io);

if (require.main === module) {
  connectDB()
    .then(() => {
      server.listen(port, () => {
        console.log(`Backend running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect MongoDB:', error);
      process.exit(1);
    });
}

module.exports = { app, server, io };
