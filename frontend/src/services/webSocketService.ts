// Frontend WebSocket service for real-time features
import { io, Socket } from 'socket.io-client';

export interface WebSocketUser {
  id: string;
  username: string;
  email?: string;
  connectedAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface LearningProgressEvent {
  skill: string;
  progress: number;
  milestone?: string;
  achievement?: string;
  timestamp: string;
}

export interface VideoWatchEvent {
  videoId: string;
  title: string;
  duration: number;
  progress: number;
  completed: boolean;
  timestamp: string;
}

export interface AIInteractionEvent {
  agentType: string;
  query: string;
  response?: any;
  interesting?: boolean;
  shareResult?: boolean;
  timestamp: string;
}

export interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onAuthenticated?: (data: { user: WebSocketUser; serverTime: string }) => void;
  onUserJoined?: (data: { user: WebSocketUser }) => void;
  onUserLeft?: (data: { user: WebSocketUser; reason: string }) => void;
  onProgressUpdated?: (data: LearningProgressEvent & { userId: string; username: string }) => void;
  onUserAchievement?: (data: { user: WebSocketUser; achievement: string; timestamp: string }) => void;
  onAIInteractionComplete?: (data: AIInteractionEvent & { userId: string; username: string }) => void;
  onVideoProgressSaved?: (data: VideoWatchEvent & { userId: string; username: string }) => void;
  onUserVideoCompleted?: (data: { user: WebSocketUser; video: { title: string; duration: number }; timestamp: string }) => void;
  onSystemNotification?: (notification: { type: string; title: string; message: string; timestamp: string }) => void;
  onUserNotification?: (notification: { type: string; title: string; message: string; timestamp: string }) => void;
  onError?: (error: { message: string }) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private callbacks: WebSocketCallbacks = {};
  private user: WebSocketUser | null = null;

  constructor() {
    this.setupEventListeners();
  }

  connect(serverUrl: string = 'http://localhost:5002'): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve(true);
          return;
        }

        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
          autoConnect: true
        });

        this.setupSocketListeners();

        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.callbacks.onConnect?.();
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Set timeout for initial connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.stopHeartbeat();
      this.callbacks.onDisconnect?.(reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('authenticated', (data) => {
      console.log('✅ WebSocket authenticated:', data.user.username);
      this.user = data.user;
      this.callbacks.onAuthenticated?.(data);
    });

    this.socket.on('authError', (error) => {
      console.error('❌ Authentication error:', error);
      this.callbacks.onError?.(error);
    });

    this.socket.on('userJoined', (data) => {
      console.log('👋 User joined:', data.user.username);
      this.callbacks.onUserJoined?.(data);
    });

    this.socket.on('userLeft', (data) => {
      console.log('👋 User left:', data.user.username);
      this.callbacks.onUserLeft?.(data);
    });

    this.socket.on('progressUpdated', (data) => {
      console.log('📈 Progress updated:', data);
      this.callbacks.onProgressUpdated?.(data);
    });

    this.socket.on('userAchievement', (data) => {
      console.log('🏆 User achievement:', data);
      this.callbacks.onUserAchievement?.(data);
    });

    this.socket.on('aiInteractionComplete', (data) => {
      console.log('🤖 AI interaction complete:', data);
      this.callbacks.onAIInteractionComplete?.(data);
    });

    this.socket.on('videoProgressSaved', (data) => {
      console.log('📺 Video progress saved:', data);
      this.callbacks.onVideoProgressSaved?.(data);
    });

    this.socket.on('userVideoCompleted', (data) => {
      console.log('🎬 User completed video:', data);
      this.callbacks.onUserVideoCompleted?.(data);
    });

    this.socket.on('systemNotification', (notification) => {
      console.log('📢 System notification:', notification);
      this.callbacks.onSystemNotification?.(notification);
    });

    this.socket.on('userNotification', (notification) => {
      console.log('📬 User notification:', notification);
      this.callbacks.onUserNotification?.(notification);
    });

    this.socket.on('heartbeatAck', (data) => {
      // Silent heartbeat acknowledgment
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.callbacks.onError?.(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.startHeartbeat();
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error);
      this.handleReconnect();
    });
  }

  private setupEventListeners() {
    // Listen for page visibility changes to manage connections
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopHeartbeat();
        } else if (this.isConnected) {
          this.startHeartbeat();
        }
      });
    }

    // Listen for network status changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Network connection restored');
        if (!this.isConnected) {
          this.handleReconnect();
        }
      });

      window.addEventListener('offline', () => {
        console.log('🌐 Network connection lost');
        this.stopHeartbeat();
      });
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.socket?.connect();
      }
    }, delay);
  }

  authenticate(userData: { userId?: string; username: string; email?: string }): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot authenticate: WebSocket not connected');
      return;
    }

    console.log('🔐 Authenticating user:', userData.username);
    this.socket.emit('authenticate', userData);
  }

  updateLearningProgress(progress: LearningProgressEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot update progress: WebSocket not connected');
      return;
    }

    this.socket.emit('learningProgress', progress);
  }

  reportAIInteraction(interaction: AIInteractionEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot report AI interaction: WebSocket not connected');
      return;
    }

    this.socket.emit('aiInteraction', interaction);
  }

  reportVideoWatch(watchEvent: VideoWatchEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot report video watch: WebSocket not connected');
      return;
    }

    this.socket.emit('videoWatched', watchEvent);
  }

  joinStudyRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot join study room: WebSocket not connected');
      return;
    }

    this.socket.emit('joinStudyRoom', roomId);
  }

  leaveStudyRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot leave study room: WebSocket not connected');
      return;
    }

    this.socket.emit('leaveStudyRoom', roomId);
  }

  setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    this.stopHeartbeat();
    this.socket?.disconnect();
    this.isConnected = false;
    this.user = null;
  }

  isWebSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getCurrentUser(): WebSocketUser | null {
    return this.user;
  }

  // Static method to check WebSocket server availability
  static async checkServerHealth(serverUrl: string = 'http://localhost:5002'): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('❌ WebSocket server health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();