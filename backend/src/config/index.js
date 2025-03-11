import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // WebSocket configuration
  wsPort: process.env.WS_PORT || 3001,
  
  // File system configuration
  conversationsDir: process.env.CONVERSATIONS_DIR || path.resolve(process.cwd(), '../../conversations'),
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export default config;