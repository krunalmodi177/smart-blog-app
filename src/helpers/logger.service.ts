import { createLogger, format, transports, Logger } from 'winston';

// Define the environment type
const environment: string = process.env.NODE_ENV || 'local';
const env = {
    dev: 'development',
    test: 'testing',
    prod: 'production',
    local: 'local',
  };
  
  
// Define the custom format for enumerating errors
const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Create the logger
const logger: Logger = createLogger({
  level: environment === env.dev || environment === env.local ? 'debug' : 'info',
  format: format.combine(
    enumerateErrorFormat(),
    environment === env.dev || environment === env.local
      ? format.colorize()
      : format.uncolorize(),
    format.splat(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`,
    ),
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  exitOnError: false,
});

// Export the logger
export default logger;
