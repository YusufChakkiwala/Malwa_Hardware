require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocketService } = require('./services/socketService');

const startPort = Number(process.env.PORT) || 5000;

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
      server.on('error', (error) => {
        if (error && error.code === 'EADDRINUSE') {
          console.error(`Port ${startPort} is already in use.`);
          console.error(
            'Stop the other backend process or set a different PORT in backend/.env, then restart.'
          );
          process.exit(1);
        }

        console.error('Failed to start server:', error);
        process.exit(1);
      });

      server.listen(startPort, () => {
        console.log(`Backend running on http://localhost:${startPort}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect MongoDB:', error);
      process.exit(1);
    });
}

module.exports = { app, server, io };
