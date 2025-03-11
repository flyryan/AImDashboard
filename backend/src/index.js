import Server from './server.js';
import logger from './utils/logger.js';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection');
  logger.error(reason);
  process.exit(1);
});

// Handle termination signals
process.on('SIGINT', () => {
  logger.info('Received SIGINT signal. Shutting down gracefully...');
  shutdown();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal. Shutting down gracefully...');
  shutdown();
});

// Create and start the server
const server = new Server();

async function startup() {
  try {
    logger.info('Starting server...');
    await server.start();
    logger.info('Server started successfully');
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

function shutdown() {
  try {
    logger.info('Shutting down server...');
    server.stop();
    logger.info('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startup();