// @ravana/core/lib/logging/logging.ts
import { Logger, createLogger, format, transports } from "winston";
import { LoggingConfig } from "./config";

let instance: Logging | null = null; // Singleton instance
export let log: Logger; // Global logger instance

export class Logging {
  private logger: Logger;

  private constructor(private loggingConfig: LoggingConfig) {
    this.validateConfig(this.loggingConfig);
    this.logger = this.createLogger(this.loggingConfig);
    log = this.logger; // Set the global logger instance
  }

  public static getInstance(loggingConfig: LoggingConfig): Logging {
    if (!instance) {
      instance = new Logging(loggingConfig);
    }
    return instance;
  }

  private validateConfig(loggingConfig: LoggingConfig): void {
    const { level, logFileName, logDir } = loggingConfig;
    if (!level || !logFileName || !logDir) {
      throw new Error(
        "Invalid logging configuration. Required fields are missing."
      );
    }
  }

  private createLogger(loggingConfig: LoggingConfig): Logger {
    return createLogger({
      level: loggingConfig.level,
      format: format.combine(
        format.uncolorize(),
        format.json(),
        format.timestamp({
          format() {
            return new Date().toISOString();
          },
        })
      ),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      ],
    });
  }

  async debug(message: string, meta: Record<string, any> = {}): Promise<void> {
    try {
      this.logger.debug(message, meta);
    } catch (error) {
      console.error("Failed to log debug message:", error);
    }
  }

  async warn(message: string, meta: Record<string, any> = {}): Promise<void> {
    try {
      this.logger.warn(message, meta);
    } catch (error) {
      console.error("Failed to log warn message:", error);
    }
  }

  async info(message: string, meta: Record<string, any> = {}): Promise<void> {
    try {
      this.logger.info(message, meta);
    } catch (error) {
      console.error("Failed to log info message:", error);
    }
  }

  async error(message: string, meta: Record<string, any> = {}): Promise<void> {
    try {
      this.logger.error(message, meta);
    } catch (error) {
      console.error("Failed to log error message:", error);
    }
  }

  getLogger(): Logger {
    return this.logger;
  }
}
