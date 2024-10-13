// @ravana/core/lib/mongo/config.ts
export interface MongoConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly pass: string;
  readonly dbAuthSource: string;
  readonly dbName: string;
}
