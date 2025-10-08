// WebSocket server implementation for real-time features
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const EventEmitter = require('events');

class WebSocketServer {
  constructor(port = 5002) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: ["http://localhost:3001", "http://127.0.0.1:3001"],
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.port = port;
    this.connectedUsers = new Map();
    this.rooms = new Map();
    
    this.setupMiddleware();
    this.setupSocketHandlers();
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ["http://localhost:3001", "http://127.0.0.1:3001"],
      credentials: true
    }));
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        connectedUsers: this.connectedUsers.size,
        rooms: this.rooms.size,
        timestamp: new Date().toISOString()
      });
    });

    // User status endpoint
    this.app.get('/users/online', (req, res) => {
      const onlineUsers = Array.from(this.connectedUsers.values()).map(user => ({
        id: user.id,
        username: user.username,
        lastActivity: user.lastActivity
      }));
      res.json({ onlineUsers, count: onlineUsers.length });
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);
      
      // Authentication handler
      socket.on('authenticate', (userData) => {
        try {
          const user = {
            socketId: socket.id,
            id: userData.userId || socket.id,
            username: userData.username || `User_${socket.id.substring(0, 6)}`,
            email: userData.email,
            connectedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true
          };

          this.connectedUsers.set(socket.id, user);
          socket.userId = user.id;
          socket.username = user.username;

          // Join user to their personal room
          socket.join(`user:${user.id}`);
          
          // Send successful authentication
          socket.emit('authenticated', {
            success: true,
            user: user,
            serverTime: new Date().toISOString()
          });

          // Broadcast user joined to all clients
          socket.broadcast.emit('userJoined', {
            user: {
              id: user.id,
              username: user.username,
              connectedAt: user.connectedAt
            }
          });

          console.log(`✅ User authenticated: ${user.username} (${user.id})`);
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authError', { message: 'Authentication failed' });
        }
      });

      // Learning progress updates
      socket.on('learningProgress', (data) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) return;

          const progressUpdate = {
            userId: user.id,
            username: user.username,
            progress: data,
            timestamp: new Date().toISOString()
          };

          // Update user's last activity
          user.lastActivity = new Date().toISOString();

          // Emit to user's personal room
          this.io.to(`user:${user.id}`).emit('progressUpdated', progressUpdate);

          // Broadcast achievement if milestone reached
          if (data.milestone || data.achievement) {
            socket.broadcast.emit('userAchievement', {
              user: { id: user.id, username: user.username },
              achievement: data.achievement || data.milestone,
              timestamp: progressUpdate.timestamp
            });
          }

          console.log(`📈 Progress update from ${user.username}:`, data);
        } catch (error) {
          console.error('Learning progress error:', error);
          socket.emit('error', { message: 'Failed to update progress' });
        }
      });

      // AI interaction updates
      socket.on('aiInteraction', (data) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) return;

          const interaction = {
            userId: user.id,
            username: user.username,
            agentType: data.agentType,
            query: data.query,
            response: data.response,
            timestamp: new Date().toISOString()
          };

          // Update user's last activity
          user.lastActivity = new Date().toISOString();

          // Send interaction result back to user
          socket.emit('aiInteractionComplete', interaction);

          // Optionally broadcast interesting interactions (anonymized)
          if (data.shareResult && data.interesting) {
            socket.broadcast.emit('sharedInsight', {
              agentType: data.agentType,
              insight: data.insight,
              timestamp: interaction.timestamp
            });
          }

          console.log(`🤖 AI interaction from ${user.username}: ${data.agentType}`);
        } catch (error) {
          console.error('AI interaction error:', error);
          socket.emit('error', { message: 'AI interaction failed' });
        }
      });

      // Video watch updates
      socket.on('videoWatched', (data) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) return;

          const watchEvent = {
            userId: user.id,
            username: user.username,
            videoId: data.videoId,
            title: data.title,
            duration: data.duration,
            progress: data.progress,
            completed: data.completed,
            timestamp: new Date().toISOString()
          };

          // Update user's last activity
          user.lastActivity = new Date().toISOString();

          // Send confirmation to user
          socket.emit('videoProgressSaved', watchEvent);

          // Broadcast completion if video was finished
          if (data.completed) {
            socket.broadcast.emit('userVideoCompleted', {
              user: { id: user.id, username: user.username },
              video: { title: data.title, duration: data.duration },
              timestamp: watchEvent.timestamp
            });
          }

          console.log(`📺 Video progress from ${user.username}: ${data.title} (${data.progress}%)`);
        } catch (error) {
          console.error('Video watch error:', error);
          socket.emit('error', { message: 'Failed to save video progress' });
        }
      });

      // Join study room
      socket.on('joinStudyRoom', (roomId) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) return;

          socket.join(roomId);
          
          if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
              id: roomId,
              members: new Set(),
              createdAt: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            });
          }

          const room = this.rooms.get(roomId);
          room.members.add(user.id);
          room.lastActivity = new Date().toISOString();

          // Notify room members
          socket.to(roomId).emit('userJoinedRoom', {
            user: { id: user.id, username: user.username },
            roomId: roomId,
            memberCount: room.members.size
          });

          socket.emit('joinedStudyRoom', {
            roomId: roomId,
            memberCount: room.members.size,
            members: Array.from(room.members)
          });

          console.log(`🚪 ${user.username} joined study room: ${roomId}`);
        } catch (error) {
          console.error('Join study room error:', error);
          socket.emit('error', { message: 'Failed to join study room' });
        }
      });

      // Leave study room
      socket.on('leaveStudyRoom', (roomId) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) return;

          socket.leave(roomId);
          
          if (this.rooms.has(roomId)) {
            const room = this.rooms.get(roomId);
            room.members.delete(user.id);
            
            if (room.members.size === 0) {
              this.rooms.delete(roomId);
            } else {
              room.lastActivity = new Date().toISOString();
              
              // Notify remaining members
              socket.to(roomId).emit('userLeftRoom', {
                user: { id: user.id, username: user.username },
                roomId: roomId,
                memberCount: room.members.size
              });
            }
          }

          console.log(`🚪 ${user.username} left study room: ${roomId}`);
        } catch (error) {
          console.error('Leave study room error:', error);
        }
      });

      // Handle heartbeat for connection monitoring
      socket.on('heartbeat', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.lastActivity = new Date().toISOString();
          socket.emit('heartbeatAck', { timestamp: user.lastActivity });
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (user) {
            console.log(`❌ User disconnected: ${user.username} (${reason})`);
            
            // Remove from all rooms
            this.rooms.forEach((room, roomId) => {
              if (room.members.has(user.id)) {
                room.members.delete(user.id);
                socket.to(roomId).emit('userLeftRoom', {
                  user: { id: user.id, username: user.username },
                  roomId: roomId,
                  memberCount: room.members.size
                });
                
                if (room.members.size === 0) {
                  this.rooms.delete(roomId);
                }
              }
            });

            // Broadcast user left
            socket.broadcast.emit('userLeft', {
              user: { id: user.id, username: user.username },
              reason: reason,
              timestamp: new Date().toISOString()
            });

            // Remove from connected users
            this.connectedUsers.delete(socket.id);
          }
        } catch (error) {
          console.error('Disconnect handling error:', error);
        }
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });

    // Periodic cleanup of inactive rooms
    setInterval(() => {
      const now = new Date();
      this.rooms.forEach((room, roomId) => {
        const lastActivity = new Date(room.lastActivity);
        const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
        
        if (inactiveMinutes > 60) { // Remove rooms inactive for 1 hour
          console.log(`🧹 Cleaning up inactive room: ${roomId}`);
          this.rooms.delete(roomId);
        }
      });
    }, 300000); // Check every 5 minutes
  }

  // Send system notifications
  broadcastSystemNotification(notification) {
    this.io.emit('systemNotification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send targeted notification to specific user
  sendUserNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit('userNotification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 WebSocket server running on port ${this.port}`);
      console.log(`📡 CORS enabled for: http://localhost:3001, http://127.0.0.1:3001`);
    });
  }

  stop() {
    this.io.close();
    this.server.close();
    console.log('🛑 WebSocket server stopped');
  }
}

// Create and start the WebSocket server
const wsServer = new WebSocketServer(5002);
wsServer.start();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  wsServer.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  wsServer.stop();
  process.exit(0);
});

module.exports = WebSocketServer;