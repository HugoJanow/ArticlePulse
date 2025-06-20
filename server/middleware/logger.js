const config = require('../config');

/**
 * Logger simple pour l'application
 */
class Logger {
  static levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  static getCurrentLevel() {
    return this.levels[config.LOG_LEVEL] || this.levels.info;
  }

  static log(level, message, meta = {}) {
    if (this.levels[level] <= this.getCurrentLevel()) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta
      };

      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  static error(message, meta = {}) {
    this.log('error', message, meta);
  }

  static warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  static info(message, meta = {}) {
    this.log('info', message, meta);
  }

  static debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

/**
 * Middleware de logging des requêtes
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  Logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    Logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Middleware de gestion des erreurs
 */
const errorLogger = (err, req, res, next) => {
  Logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });

  next(err);
};

module.exports = {
  Logger,
  requestLogger,
  errorLogger
};
