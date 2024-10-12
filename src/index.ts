import { Server } from "http";
import {
  startApp,
  initAppEnv,
  initLogging,
  initMongoConnection,
} from "./appConfig";
import { log, Mongo } from "./lib";

let server: Server;
let mongoConnection: Mongo;

const main = async () => {
  try {
    const appEnv = initAppEnv(process.cwd());
    const loggingInstance = initLogging(appEnv);
    mongoConnection = await initMongoConnection(appEnv, loggingInstance);

    server = startApp(appEnv, loggingInstance, mongoConnection);
  } catch (err: any) {
    console.log("Failed to start app");
    process.exit(1)
  }
};

main();

process.on("SIGINT", async () => {
  log.info("SIGINT signal received. Shutting down gracefully...");
  server.close(async () => {
    log.info("HTTP server closed");
    try {
      await mongoConnection.disconnect();
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
