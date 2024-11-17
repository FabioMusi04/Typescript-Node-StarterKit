import winston from 'winston';
const { combine, timestamp, colorize, printf } = winston.format;

winston.addColors({
  get: 'green',
  post: 'blue',
  put: 'yellow',
  delete: 'red',
  patch: 'magenta',
  success: 'green',  // For 2xx status codes
  redirection: 'yellow', // For 3xx status codes
  clientError: 'red', // For 4xx status codes
  serverError: 'magenta', // For 5xx status codes
});

const getStatusCodeColor = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'success'; // Green for 2xx
  } else if (statusCode >= 300 && statusCode < 400) {
    return 'redirection'; // Yellow for 3xx
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'clientError'; // Red for 4xx
  } else if (statusCode >= 500 && statusCode < 600) {
    return 'serverError'; // Magenta for 5xx
  }
  return 'white'; // Default color for other status codes
};
const httpCustomFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const [method, url, statusCode] = message.split(' ');

  const coloredMethod = winston.format.colorize().colorize(method.toLowerCase(), method);
  const coloredStatusCode = winston.format.colorize().colorize(getStatusCodeColor(Number(statusCode)), statusCode);

  return `${timestamp} [${level}] ${coloredMethod} ${url} ${coloredStatusCode} ${message.split(' ').slice(3).join(' ')} ${JSON.stringify(metadata)}`;
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
        winston.format.colorize({ all: true }),
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
    colorize({ all: true }),
    printf(({ level, message, timestamp, ...metadata }) => {
      return `${timestamp} [${level}] ${message} ${JSON.stringify(metadata)}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export const requestLogger = (req: { method: any; url: any; }, res: { on?: any; statusCode?: any; }, next: () => void) => {
  const start = Date.now(); 

  res.on('finish', () => {
    const { method, url } = req;
    const { statusCode } = res;
    const responseTime = Date.now() - start;  

    httpLogger.http(`${method} ${url} ${statusCode} ${responseTime}ms`);
  });

  next();
};

export { httpLogger, generalLogger };
