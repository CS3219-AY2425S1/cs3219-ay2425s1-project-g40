import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import { Redis } from "ioredis";
import { Server as SocketIoServer } from "socket.io";
import { handleConnection } from "./handler/wsEventHander";
import app from "./server";

const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379
const REDIS_HOST = process.env.REDIS_HOST || "localhost"

/**
 * Websocket server
 */

const pubClient = new Redis(REDIS_PORT, REDIS_HOST)
const subClient = pubClient.duplicate()

const wsServer = http.createServer(app);
const ws = new SocketIoServer(wsServer, {
  cors: { origin: "*"},
  adapter: createAdapter(pubClient, subClient)
});

ws.on("connection", (socket) => {
  console.log(`User connected! ${socket.id}`)
  handleConnection(socket);
})


export default wsServer;