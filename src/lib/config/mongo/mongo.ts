// @ravana/core/lib/mongo/mongo.ts
import { connect, disconnect, Mongoose } from "mongoose";
import { Logging } from "../logging/logging";
import { MongoConfig } from "./config";

let instance: Mongo | null = null; // Singleton instance

export class Mongo {
  private isConnected: boolean = false; // Track connection state
  private mongooseConnection: Mongoose | null = null; // Store the connection instance

  private constructor(private mongoConfig: MongoConfig, private log: Logging) {}

  // Static method to get or create the Mongo instance
  public static getInstance(mongoConfig: MongoConfig, log: Logging): Mongo {
    if (!instance) {
      instance = new Mongo(mongoConfig, log); // Create new instance if it doesn't exist
    }
    return instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      this.log.info("Already connected to MongoDB.");
      return; // No need to connect again if already connected
    }
    await this.mongoConnectionFactory();
  }

  public async disconnect(): Promise<void> {
    await this.disconnectDB();
  }

  // Private method to establish a MongoDB connection
  private async mongoConnectionFactory(): Promise<void> {
    try {
      const { host, port, user, pass, dbAuthSource, dbName } = this.mongoConfig;
      const connectionString = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=${dbAuthSource}`;
      this.log.debug("Initializing MongoDB connection", {
        connString: connectionString });

      this.mongooseConnection = await connect(connectionString);
      this.isConnected = true; // Mark as connected
      this.log.info("MongoDB connected successfully");
    } catch (error: any) {
      this.log.error("Error connecting to MongoDB", {
        msg: error.message,
        stack: error.stack,
      });
      process.exit(1); // Exit process if connection fails
    }
  }

  // Private method to handle MongoDB disconnection
  async disconnectDB(): Promise<void> {
    if (!this.isConnected) {
      this.log.info("MongoDB is already disconnected.");
      return; // No need to disconnect if not connected
    }
    try {
      if( this.mongooseConnection ){
        await this.mongooseConnection.disconnect();
      }
      this.isConnected = false; // Mark as disconnected
      this.mongooseConnection = null; // Clear the connection instance
      this.log.info("MongoDB disconnected successfully");
    } catch (error: any) {
      this.log.error("Error disconnecting from MongoDB", {
        msg: error.message,
        stack: error.stack,
      });
    }
  }

  // Expose the Mongoose connection object
  public getConnection(): Mongoose | null {
    return this.mongooseConnection;
  }
}
