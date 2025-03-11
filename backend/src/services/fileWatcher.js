import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import { throttle } from '../utils/throttle.js';
import logger from '../utils/logger.js';
import { parseLogFile } from './logParser.js';

class FileWatcherService {
  constructor(conversationsDir, updateCallback, throttleTime = 1000) {
    this.conversationsDir = conversationsDir;
    this.watcher = null;
    this.updateCallback = updateCallback;
    this.throttledUpdate = throttle(this._handleUpdate.bind(this), throttleTime);
  }

  /**
   * Start watching the conversations directory
   */
  start() {
    logger.info(`Starting file watcher for directory: ${this.conversationsDir}`);
    
    // Initialize watcher
    this.watcher = chokidar.watch(this.conversationsDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    // Add event listeners
    this.watcher
      .on('add', path => this._handleFileChange('add', path))
      .on('change', path => this._handleFileChange('change', path))
      .on('unlink', path => this._handleFileChange('unlink', path))
      .on('addDir', path => this._handleDirChange('add', path))
      .on('unlinkDir', path => this._handleDirChange('unlink', path))
      .on('error', error => logger.error(`Watcher error: ${error}`))
      .on('ready', () => logger.info('Initial scan complete. Ready for changes'));
  }

  /**
   * Stop watching the conversations directory
   */
  stop() {
    if (this.watcher) {
      logger.info('Stopping file watcher');
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Handle file changes (add, change, unlink)
   * @param {string} eventType - Type of event (add, change, unlink)
   * @param {string} filePath - Path to the changed file
   */
  async _handleFileChange(eventType, filePath) {
    // Only process .log files
    if (!filePath.endsWith('.log')) return;

    logger.debug(`File ${eventType} event: ${filePath}`);

    try {
      // Extract bot and user from the file path
      const pathParts = path.relative(this.conversationsDir, filePath).split(path.sep);
      
      if (pathParts.length !== 2) {
        logger.warn(`Unexpected file path structure: ${filePath}`);
        return;
      }

      const botName = pathParts[0];
      const fileName = pathParts[1];
      const userName = path.basename(fileName, '.log');

      // Queue an update
      this.throttledUpdate({
        type: eventType,
        botName,
        userName,
        filePath
      });
    } catch (error) {
      logger.error(`Error handling file change: ${error.message}`);
    }
  }

  /**
   * Handle directory changes (add, unlink)
   * @param {string} eventType - Type of event (add, unlink)
   * @param {string} dirPath - Path to the changed directory
   */
  _handleDirChange(eventType, dirPath) {
    // Ignore the root conversations directory
    if (dirPath === this.conversationsDir) return;

    logger.debug(`Directory ${eventType} event: ${dirPath}`);

    try {
      // Extract bot from the directory path
      const pathParts = path.relative(this.conversationsDir, dirPath).split(path.sep);
      
      if (pathParts.length !== 1) {
        // This is not a bot directory, ignore
        return;
      }

      const botName = pathParts[0];

      // Queue an update for the entire bot
      this.throttledUpdate({
        type: eventType,
        botName,
        dirPath
      });
    } catch (error) {
      logger.error(`Error handling directory change: ${error.message}`);
    }
  }

  /**
   * Process the update and call the update callback
   * @param {Object} update - Update object
   */
  async _handleUpdate(update) {
    try {
      if (update.type === 'unlink') {
        // File was deleted
        this.updateCallback({
          type: 'delete',
          botName: update.botName,
          userName: update.userName
        });
        return;
      }

      if (update.type === 'unlinkDir') {
        // Bot directory was deleted
        this.updateCallback({
          type: 'deleteBot',
          botName: update.botName
        });
        return;
      }

      if (update.filePath) {
        // Process file update
        const messages = await parseLogFile(update.filePath);
        
        this.updateCallback({
          type: 'update',
          botName: update.botName,
          userName: update.userName,
          messages
        });
      } else if (update.dirPath) {
        // Process directory update (new bot)
        this.updateCallback({
          type: 'newBot',
          botName: update.botName
        });
      }
    } catch (error) {
      logger.error(`Error processing update: ${error.message}`);
    }
  }
}

export default FileWatcherService;