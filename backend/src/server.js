import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import config from './config/index.js';
import SocketServer from './socket.js';
import FileWatcherService from './services/fileWatcher.js';
import { parseAllLogs } from './services/logParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.socketServer = new SocketServer(this.server);
    this.fileWatcher = null;
    this.conversations = {};
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    // Enable CORS
    this.app.use(cors({
      origin: config.corsOrigin
    }));
    
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Serve static files from the frontend build directory in production
    if (process.env.NODE_ENV === 'production') {
      const frontendPath = path.resolve(__dirname, '../../frontend/dist');
      this.app.use(express.static(frontendPath));
      logger.info(`Serving static files from ${frontendPath}`);
    }
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.url}`);
      next();
    });
  }
  
  setupRoutes() {
    // API routes
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });
    
    this.app.get('/api/conversations', (req, res) => {
      res.json(this.conversations);
    });
    
    // Catch-all route to serve the frontend in production
    if (process.env.NODE_ENV === 'production') {
      this.app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
      });
    }
    
    // Error handling middleware
    this.app.use((err, req, res, next) => {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ error: err.message });
    });
  }
  
  async start() {
    try {
      // Load initial conversations data
      await this.loadInitialData();
      
      // Set up the socket server to provide initial data to new clients
      this.socketServer.setInitialDataProvider(() => this.conversations);
      
      // Start the file watcher
      this.startFileWatcher();
      
      // Start the server
      this.server.listen(config.port, () => {
        logger.info(`Server listening on port ${config.port}`);
      });
    } catch (error) {
      logger.error(`Failed to start server: ${error.message}`);
      process.exit(1);
    }
  }
  
  async loadInitialData() {
    try {
      logger.info('Loading initial conversations data...');
      this.conversations = await parseAllLogs(config.conversationsDir);
      logger.info(`Loaded data for ${Object.keys(this.conversations).length} bots`);
    } catch (error) {
      logger.error(`Failed to load initial data: ${error.message}`);
      throw error;
    }
  }
  
  startFileWatcher() {
    // Create and start the file watcher
    this.fileWatcher = new FileWatcherService(
      config.conversationsDir,
      this.handleFileUpdate.bind(this)
    );
    
    this.fileWatcher.start();
  }
  
  handleFileUpdate(update) {
    logger.debug(`Received file update: ${JSON.stringify(update)}`);
    
    try {
      switch (update.type) {
        case 'update':
          // Update conversation data
          if (!this.conversations[update.botName]) {
            this.conversations[update.botName] = {};
          }
          
          this.conversations[update.botName][update.userName] = update.messages;
          
          // Broadcast the update to all clients
          this.socketServer.broadcast('conversationUpdate', {
            botName: update.botName,
            userName: update.userName,
            messages: update.messages
          });
          break;
          
        case 'delete':
          // Delete conversation data
          if (this.conversations[update.botName]) {
            delete this.conversations[update.botName][update.userName];
            
            // If no more conversations for this bot, delete the bot
            if (Object.keys(this.conversations[update.botName]).length === 0) {
              delete this.conversations[update.botName];
            }
            
            // Broadcast the deletion to all clients
            this.socketServer.broadcast('conversationDelete', {
              botName: update.botName,
              userName: update.userName
            });
          }
          break;
          
        case 'deleteBot':
          // Delete bot data
          delete this.conversations[update.botName];
          
          // Broadcast the deletion to all clients
          this.socketServer.broadcast('botDelete', {
            botName: update.botName
          });
          break;
          
        case 'newBot':
          // New bot added, will be populated with conversations as they are discovered
          if (!this.conversations[update.botName]) {
            this.conversations[update.botName] = {};
            
            // Broadcast the new bot to all clients
            this.socketServer.broadcast('botAdd', {
              botName: update.botName
            });
          }
          break;
          
        default:
          logger.warn(`Unknown update type: ${update.type}`);
      }
    } catch (error) {
      logger.error(`Error handling file update: ${error.message}`);
    }
  }
  
  stop() {
    // Stop the file watcher
    if (this.fileWatcher) {
      this.fileWatcher.stop();
    }
    
    // Close the server
    this.server.close(() => {
      logger.info('Server stopped');
    });
  }
}

export default Server;