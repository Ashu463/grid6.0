// logger.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * Log levels enum corresponding to Python logging levels
 */
export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50,
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  level: LogLevel;
  logToConsole: boolean;
  logToFile: boolean;
  filePath?: string;
  formatTimestamp?: boolean;
}

/**
 * Logger class comparable to Python's logging module
 */
export class Logger {
  private level: LogLevel;
  private logToConsole: boolean;
  private logToFile: boolean;
  private filePath?: string;
  private formatTimestamp: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.level = config.level ?? LogLevel.INFO;
    this.logToConsole = config.logToConsole ?? true;
    this.logToFile = config.logToFile ?? false;
    this.filePath = config.filePath;
    this.formatTimestamp = config.formatTimestamp ?? true;

    // Make sure directory exists if logging to file
    if (this.logToFile && this.filePath) {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Format the log message with timestamp and level
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = this.formatTimestamp ? new Date().toISOString() : '';
    return `${timestamp ? `[${timestamp}] ` : ''}[${level}] ${message}`;
  }

  /**
   * Write message to outputs (console and/or file)
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    ...args: any[]
  ): void {
    if (level < this.level) {
      return;
    }

    // Format message with interpolation if args provided
    let formattedMessage = message;
    if (args.length > 0) {
      formattedMessage = message.replace(/%[sdifjoO]/g, (match) => {
        const arg = args.shift();
        if (match === '%s') return String(arg);
        if (match === '%d' || match === '%i') return Number(arg).toString();
        if (match === '%f') return parseFloat(arg).toString();
        if (match === '%j') return JSON.stringify(arg);
        if (match === '%o' || match === '%O')
          return JSON.stringify(arg, null, 2);
        return match;
      });
    }

    const logEntry = this.formatMessage(levelName, formattedMessage);

    // Output to console
    if (this.logToConsole) {
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(logEntry);
          break;
        case LogLevel.WARNING:
          console.warn(logEntry);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(logEntry);
          break;
      }
    }

    // Output to file
    if (this.logToFile && this.filePath) {
      fs.appendFileSync(this.filePath, logEntry + '\n');
    }
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  /**
   * Log at INFO level
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  /**
   * Log at WARNING level
   */
  warning(message: string, ...args: any[]): void {
    this.log(LogLevel.WARNING, 'WARNING', message, ...args);
  }

  /**
   * Log at ERROR level
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  /**
   * Log at CRITICAL level
   */
  critical(message: string, ...args: any[]): void {
    this.log(LogLevel.CRITICAL, 'CRITICAL', message, ...args);
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Create a default logger instance
export const logger = new Logger();

// Example usage
// logger.info('Processing issue #%d', 123);
// logger.error('Failed to unassign issue #%d: %s', 456, 'User not found');
