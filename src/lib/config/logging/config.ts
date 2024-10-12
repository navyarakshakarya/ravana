// @ravana/core/lib/logging/config.ts
export interface LoggingConfig {
  readonly level: string;
	readonly logDir?: string;
	readonly logFileName?: string;
	readonly maxSize?: string;
	readonly maxFiles?: string;
	readonly zippedArchive?: boolean;
}