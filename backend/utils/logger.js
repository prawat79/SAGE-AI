/**
 * Logger utility for the FlowGPT Clone backend
 * Provides structured logging with different levels and formats
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Color codes for console output
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor(options = {}) {
    this.level = LOG_LEVELS[options.level?.toUpperCase()] ?? LOG_LEVELS.INFO;
    this.enableConsole = options.enableConsole ?? true;
    this.enableFile = options.enableFile ?? false;
    this.logDir = options.logDir || path.join(process.cwd(), 'logs');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.service = options.service || 'flowgpt-backend';
    
    // Create logs directory if it doesn't exist
    if (this.enableFile) {
      this.ensureLogDirectory();
    }
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   * @returns {object} Formatted log object
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      service: this.service,
      message,
      ...meta
    };

    // Add request ID if available
    if (meta.req?.id) {
      logObject.requestId = meta.req.id;
    }

    // Add user ID if available
    if (meta.req?.user?.id) {
      logObject.userId = meta.req.user.id;
    }

    // Add error stack if available
    if (meta.error instanceof Error) {
      logObject.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack
      };
    }

    return logObject;
  }

  /**
   * Format message for console output
   * @param {object} logObject - Log object
   * @returns {string} Formatted console message
   */
  formatConsoleMessage(logObject) {
    const { timestamp, level, message, requestId, userId, error } = logObject;
    const color = COLORS[level] || COLORS.RESET;
    const reset = COLORS.RESET;
    
    let formattedMessage = `${color}[${timestamp}] ${level}${reset}: ${message}`;
    
    if (requestId) {
      formattedMessage += ` [req:${requestId}]`;
    }
    
    if (userId) {
      formattedMessage += ` [user:${userId}]`;
    }
    
    if (error) {
      formattedMessage += `\n${color}Error: ${error.message}${reset}`;
      if (level === 'DEBUG' && error.stack) {
        formattedMessage += `\n${error.stack}`;
      }
    }
    
    return formattedMessage;
  }

  /**
   * Write log to file
   * @param {object} logObject - Log object
   */
  writeToFile(logObject) {
    if (!this.enableFile) return;

    try {
      const logFile = path.join(this.logDir, `${this.service}.log`);
      const logLine = JSON.stringify(logObject) + '\n';
      
      // Check file size and rotate if necessary
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxFileSize) {
          this.rotateLogFile(logFile);
        }
      }
      
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Rotate log file
   * @param {string} logFile - Path to log file
   */
  rotateLogFile(logFile) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
      
      fs.renameSync(logFile, rotatedFile);
      
      // Clean up old log files
      this.cleanupOldLogs();
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Clean up old log files
   */
  cleanupOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith(this.service) && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          mtime: fs.statSync(path.join(this.logDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      // Keep only the most recent files
      const filesToDelete = files.slice(this.maxFiles);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Log a message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  log(level, message, meta = {}) {
    const levelValue = LOG_LEVELS[level];
    
    if (levelValue > this.level) {
      return; // Skip if log level is below threshold
    }

    const logObject = this.formatMessage(level, message, meta);
    
    // Console output
    if (this.enableConsole) {
      const consoleMessage = this.formatConsoleMessage(logObject);
      console.log(consoleMessage);
    }
    
    // File output
    this.writeToFile(logObject);
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {object} meta - Additional metadata
   */
  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  /**
   * Log HTTP request
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  logRequest(req, res, duration) {
    const { method, url, ip, headers } = req;
    const { statusCode } = res;
    
    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    const meta = {
      req: {
        id: req.id,
        method,
        url,
        ip,
        userAgent: headers['user-agent'],
        user: req.user
      },
      res: {
        statusCode
      },
      duration
    };
    
    if (statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * Log database query
   * @param {string} query - SQL query
   * @param {number} duration - Query duration in ms
   * @param {object} meta - Additional metadata
   */
  logQuery(query, duration, meta = {}) {
    const message = `Database query executed in ${duration}ms`;
    this.debug(message, {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration,
      ...meta
    });
  }

  /**
   * Log AI API call
   * @param {string} provider - AI provider (openai, anthropic, etc.)
   * @param {string} model - AI model used
   * @param {number} tokens - Tokens used
   * @param {number} duration - Request duration in ms
   * @param {object} meta - Additional metadata
   */
  logAICall(provider, model, tokens, duration, meta = {}) {
    const message = `AI API call to ${provider}/${model} - ${tokens} tokens in ${duration}ms`;
    this.info(message, {
      provider,
      model,
      tokens,
      duration,
      ...meta
    });
  }

  /**
   * Log authentication event
   * @param {string} event - Auth event (login, logout, signup, etc.)
   * @param {string} userId - User ID
   * @param {object} meta - Additional metadata
   */
  logAuth(event, userId, meta = {}) {
    const message = `Authentication event: ${event}`;
    this.info(message, {
      event,
      userId,
      ...meta
    });
  }

  /**
   * Log security event
   * @param {string} event - Security event
   * @param {object} meta - Additional metadata
   */
  logSecurity(event, meta = {}) {
    const message = `Security event: ${event}`;
    this.warn(message, {
      event,
      ...meta
    });
  }

  /**
   * Create a child logger with additional context
   * @param {object} context - Additional context to include in all logs
   * @returns {Logger} Child logger instance
   */
  child(context = {}) {
    const childLogger = Object.create(this);
    childLogger.defaultMeta = { ...this.defaultMeta, ...context };
    
    // Override log method to include default meta
    childLogger.log = (level, message, meta = {}) => {
      const combinedMeta = { ...childLogger.defaultMeta, ...meta };
      return this.log(level, message, combinedMeta);
    };
    
    return childLogger;
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.LOG_LEVEL || 'INFO',
  enableConsole: process.env.NODE_ENV !== 'test',
  enableFile: process.env.ENABLE_FILE_LOGGING === 'true',
  logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
  service: 'flowgpt-backend'
});

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Generate request ID
  req.id = require('crypto').randomBytes(8).toString('hex');
  
  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    defaultLogger.logRequest(req, res, duration);
  });
  
  next();
};

// Error logging middleware
const errorLogger = (error, req, res, next) => {
  defaultLogger.error('Unhandled error', {
    error,
    req: {
      id: req.id,
      method: req.method,
      url: req.url,
      user: req.user
    }
  });
  
  next(error);
};

module.exports = {
  Logger,
  logger: defaultLogger,
  requestLogger,
  errorLogger,
  LOG_LEVELS
};