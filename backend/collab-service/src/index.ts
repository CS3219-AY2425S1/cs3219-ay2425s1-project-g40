import console from "console";
import dotenv from "dotenv";

import 'module-alias/register';
import wsServer from "./ws";

dotenv.config();

wsServer.listen(process.env.PORT, () => {
  console.log(`Collab-service running on port ${process.env.PORT}`);
});

const onCloseSignal = () => {
  console.log("sigint received, shutting down");
  wsServer.close(() => {
    console.log("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);