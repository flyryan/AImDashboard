# AI Chatbot Dashboard

A real-time dashboard for monitoring conversations between multiple AI chatbots and users.

## Overview

This dashboard provides a web-based interface for monitoring conversations between AI chatbots and users in real-time. It allows administrators to observe and analyze interactions across multiple bots and users simultaneously.

## Features

- Monitor conversations from multiple chatbots (8+)
- Track conversations with multiple users (up to 100)
- Real-time updates as conversations progress
- Multiple view options (Grid, List, Detailed)
- Filtering and search capabilities
- Responsive design for desktop and mobile

## Project Structure

```
chatbot-dashboard/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend server
└── shared/                   # Shared code between frontend and backend
```

## Technology Stack

### Frontend
- React.js
- Material-UI
- Socket.io-client
- Vite

### Backend
- Node.js
- Express.js
- Socket.io
- chokidar (file system watcher)

## Docker Deployment

The application is containerized using Docker and can be run with Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Configuration

All configuration is done through environment variables in the `.env` file:

```
# Backend Configuration
PORT=3000                           # Port the backend server runs on (internal)
CONVERSATIONS_DIR=/app/conversations # Directory inside the container where conversation logs are stored
WS_PORT=3001                        # WebSocket port (internal)
LOG_LEVEL=info                      # Logging level (debug, info, warn, error)
CORS_ORIGIN=http://frontend         # CORS origin for the frontend (internal container name)

# Docker Configuration
WEB_PORT=80                         # Single web port exposed to the host
CONVERSATIONS_PATH=./conversations  # Path to the conversations directory on the host
LOGS_PATH=./logs                    # Path to store logs on the host
NODE_ENV=production                 # Node environment (development, production)
```

### Running with Docker Compose

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The dashboard will be available at `http://localhost:80` (or whatever port you specified in WEB_PORT).

## Conversation Directory Structure

The dashboard monitors a directory structure containing chatbot conversation logs. The structure should be:

```
conversations/
├── BotName1/
│   ├── user1.log
│   ├── user2.log
│   └── ...
├── BotName2/
│   ├── user3.log
│   └── ...
└── ...
```

Each log file should contain messages in the format:
```
[TIMESTAMP] USER: message
[TIMESTAMP] Bot: *BOT_NAME has entered the chat*
Multi-line bot message...
```

## Development Setup

If you want to run the application without Docker for development:

1. Install dependencies:
   ```
   npm install
   cd backend && npm install
   cd frontend && npm install
   ```

2. Start the backend:
   ```
   cd backend && npm start
   ```

3. Start the frontend:
   ```
   cd frontend && npm run dev
   ```

4. Access the dashboard at `http://localhost:5173`

## License

[ISC](LICENSE)
