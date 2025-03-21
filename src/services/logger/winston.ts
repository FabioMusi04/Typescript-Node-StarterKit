import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const { combine, timestamp, colorize, printf } = winston.format;

winston.addColors({
  success: 'green',
  redirection: 'yellow',
  clientError: 'red',
  serverError: 'magenta',
  get: 'cyan',
  post: 'blue',
  put: 'yellow',
  delete: 'red',
  patch: 'magenta',
});


const getStatusCodeColor = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) return 'success';
  if (statusCode >= 300 && statusCode < 400) return 'redirection';
  if (statusCode >= 400 && statusCode < 500) return 'clientError';
  if (statusCode >= 500 && statusCode < 600) return 'serverError';
  return undefined; // Use default log color
};


const httpCustomFormat = printf((info: winston.Logform.TransformableInfo) => {
  const { level, message, timestamp, ...metadata } = info;
  const [method, url, statusCode] = (message as string).split(' ');

  const coloredMethod = winston.format.colorize().colorize(method.toLowerCase() || 'default', method || 'METHOD');
  const coloredStatusCode = winston.format.colorize().colorize(
    getStatusCodeColor(Number(statusCode)) || 'default',
    statusCode.toString()
  );

  return `${timestamp} [${level}] ${coloredMethod} ${url} ${coloredStatusCode} ${(message as string).split(' ').slice(3).join(' ')} ${JSON.stringify(metadata)}`;
});

const httpLogger = winston.createLogger({
  level: 'http',
  format: combine(
    timestamp(),
    httpCustomFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        timestamp(),
        httpCustomFormat
      ),
    }),
  ],
});


const generalLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    colorize(),
    printf(({ level, message, timestamp, ...metadata }) => {
      let formattedMessage: string | null | undefined = null;

      if (typeof message === 'object') {
        formattedMessage = JSON.stringify(message, null, 2);
      } else {
        formattedMessage = (message as string).toString();
      }

      const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
      return `${timestamp} [${level}] ${formattedMessage} ${meta}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const { method, url } = req;
    if (method === 'OPTIONS') return;
    const { statusCode } = res;
    const responseTime = Date.now() - start;

    httpLogger.http(`${method} ${url} ${statusCode} ${responseTime}ms`);
  });
  next();
};

export { httpLogger, generalLogger };
