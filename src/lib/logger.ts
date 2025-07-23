import { NextApiRequest } from 'next';
import winston from 'winston';
import { format } from 'winston';

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Request logging
export const logRequest = (req: NextApiRequest) => {
  return {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    user: req.user?.id,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  };
};

// Error logging
export const logError = (error: Error, req?: NextApiRequest) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name
  };

  if (req) {
    Object.assign(errorLog, logRequest(req));
  }

  return errorLog;
};

export const logSecurityEvent = (
  event: string,
  req: NextApiRequest,
  details: Record<string, unknown> = {}
) => {
  logger.warn({
    message: event,
    ...details,
    path: req.url,
    method: req.method,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });
};

// Export logger
export { logger }; 