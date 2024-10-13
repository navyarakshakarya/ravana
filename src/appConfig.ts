import { Environment, Logging, LoggingConfig, Mongo, toUri } from "./lib";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import router from "./route";
import express, { Express, Request, Response, NextFunction } from "express";
import { resolver } from "./api/pkg/graphql";
import { expressMiddleware } from '@apollo/server/express4';
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { printSchema } from "graphql";
import { ApolloServer } from "@apollo/server";

// Initialize environment configuration
export const initAppEnv = (baseDir?: string): Environment => {
  const env = Environment.getInstance(baseDir);
  console.log("Environment variable loaded");
  return env;
};

// Initialize logging
export const initLogging = (env: Environment): Logging => {
  const loggingConfig: LoggingConfig = {
    level: env.getStr("LOG_LEVEL"),
    logDir: env.getStr("LOG_DIR"),
    logFileName: env.getStr("LOG_FILE_NAME"),
    zippedArchive: env.getBool("LOG_ZIPPED_ARCHIVE"),
    maxSize: env.getStr("LOG_MAX_SIZE"),
    maxFiles: env.getStr("LOG_MAX_FILES"),
  };
  const log: Logging = Logging.getInstance(loggingConfig);
  log.info("Logging Initialized");
  return log;
};

// Initialize MongoDB connection
export const initMongoConnection = async (
  env: Environment,
  log: Logging
): Promise<Mongo> => {
  const mongoConfig = {
    host: env.getStr("MONGO_HOST"),
    port: env.getInt("MONGO_PORT"),
    user: toUri(env.getStr("MONGO_USER")),
    pass: toUri(env.getStr("MONGO_PASS")),
    dbAuthSource: env.getStr("MONGO_AUTH_SOURCE"),
    dbName: env.getStr("MONGO_DB_NAME"),
  };
  const mongo = Mongo.getInstance(mongoConfig, log);
  await mongo.connect();
  return mongo;
};

// Initialize Express application
export const startApp = (env: Environment, log: Logging, mongo: Mongo) => {
  const app: Express = express();
  const port = env.getStr("APP_PORT") || 3000;

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      code: 200,
      method: req.method,
      status: "running",
      version: process.env.VERSION,
      app_name: process.env.APP_NAME,
      time: new Date(),
      message: "Server is running",
    });
  });

  // console.log("Schema loaded: ", printSchema(typeDefs));

  // const apollo = new ApolloServer({
  //   typeDefs,
  //   resolvers: resolver,
  // });

  // app.all("/graphql", expressMiddleware(graphQLServer));

  const baseUrl = env.getStr("BASE_URL") + env.getStr("APP_VERSION");
  app.use(baseUrl, router);

  const server = app.listen(port, () => {
    log.info(`Server is running on port ${port}`);
  });

  server.on("error", log.error);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    log.info("SIGINT signal received. Shutting down gracefully...");
    server.close(async () => {
      log.info("HTTP server closed");
      try {
        await mongo.disconnect();
        log.info("MongoDB connection closed");
      } catch (error: any) {
        log.error("Error closing MongoDB connection", {
          msg: error.message,
        });
      }
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      log.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  });

  return server;
};
