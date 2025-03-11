import { Server } from 'socket.io';
import logger from './utils/logger.js';
import config from './config/index.js';

class SocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
      }
    });
    
    this.connectedClients = 0;
    this.setupEventHandlers();
    
    logger.info('Socket.io server initialized');
  }
  
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.connectedClients++;
      logger.info(`Client connected. Total clients: ${this.connectedClients}`);
      
      // Send initial data to the client
      this.sendInitialData(socket);
      
      // Handle client events
      socket.on('disconnect', () => {
        this.connectedClients--;
        logger.info(`Client disconnected. Total clients: ${this.connectedClients}`);
      });
      
      socket.on('error', (error) => {
        logger.error(`Socket error: ${error.message}`);
      });
    });
  }
  
  /**
   * Send initial data to a newly connected client
   * @param {Object} socket - Socket.io socket
   */
  sendInitialData(socket) {
    // This will be called with the initial data from the server.js
  }
  
  /**
   * Broadcast an update to all connected clients
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcast(event, data) {
    this.io.emit(event, data);
    logger.debug(`Broadcasting ${event} event to ${this.connectedClients} clients`);
  }
  
  /**
   * Send an update to a specific client
   * @param {string} socketId - Socket ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  sendToClient(socketId, event, data) {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
      logger.debug(`Sent ${event} event to client ${socketId}`);
    } else {
      logger.warn(`Client ${socketId} not found`);
    }
  }
  
  /**
   * Set the function to retrieve initial data for new clients
   * @param {Function} getInitialDataFn - Function that returns the initial data
   */
  setInitialDataProvider(getInitialDataFn) {
    this.sendInitialData = async (socket) => {
      try {
        const initialData = await getInitialDataFn();
        socket.emit('initialData', initialData);
        logger.debug(`Sent initial data to client ${socket.id}`);
      } catch (error) {
        logger.error(`Error sending initial data: ${error.message}`);
        socket.emit('error', { message: 'Failed to load initial data' });
      }
    };
  }
}

export default SocketServer;