/**
 * Adapted from @codemirror/collab for websockets
 * 
 * Reference: https://codemirror.net/examples/collab/
 * 
 * TLDR:
 * Clients can pull updates (getting updates when they're available).
 * Clients can push updates (sending their own changes).
 * If a client requests updates and none are available, the request is stored and fulfilled when new updates are pushed * by other (pending queue)
 */
import { Update } from "@codemirror/collab";
import { ChangeSet, Text } from "@codemirror/state";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import { Redis } from "ioredis";
import { Server as SocketIoServer } from "socket.io";
import log from "./logger";

const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379
const REDIS_HOST = process.env.REDIS_HOST || "localhost"

/**
 * Websocket server
 */

const pubClient = new Redis(REDIS_PORT, REDIS_HOST)
pubClient.on("error", (err) => {
  log("🛑 Something went wrong with Redis. Exiting....")
  process.exit()
})
const subClient = pubClient.duplicate()

const wsServer = http.createServer();
const ws = new SocketIoServer(wsServer, {
  cors: { origin: "*", methods: ["GET", "POST"]},
  adapter: createAdapter(pubClient, subClient) 
});

/**
 * TODO
 * 
 * - Store and retrieve room data from Redis instead
 */
type RoomData = {
  users: string[];
  updates: Update[];
  code: Text;
  pending: ((value: any) => void)[]
}

const roomData: Record<string, RoomData> = {}

const initRoom = (roomId: string): void => {
  if (!roomData[roomId]) {
    roomData[roomId] = {
      users: [],
      updates: [],
      code: Text.of([`print("Hello room ${roomId}")`]),
      /**
       * Stores callback functions that is executed when new updates are available
       * - Updated in pullUpdates
       * - Called in pushUpdates
       */
      pending: []
    }
  }
}

ws.of("/").adapter.on("leave-room", (room: string, id: string) => {
  log(`User disconnected ${room}`)
  ws.to(room).emit("userDisconnected");
});

ws.on("connection", (socket) => {
  log('User connected!', socket.id)

  socket.on("joinRoom", (roomId: string, userId: string) => {
    socket.join(roomId);
    log(`${userId} joined room: ${roomId}`);
    initRoom(roomId);
    roomData[roomId].users.push(userId);
    if (roomData[roomId].users.length === 2) {
      socket.nsp.to(roomId).emit("joinedRoom", userId); // notify all users that there are 2 users, session can start
    }
  })

  socket.on("getDocument", (roomId: string) => {
    initRoom(roomId);
    const room = roomData[roomId]
    log(`Received getDocument for room ${roomId}...`)
		socket.emit("getDocumentResponse", room.updates.length, room.code.toString());
	})

	socket.on('pushUpdates', (roomId, version, codeUpdates) => {
    initRoom(roomId)
    const room = roomData[roomId]
    log(`Room ${roomId} received pushUpdates...`)
		codeUpdates = JSON.parse(codeUpdates);
		try {
			if (version != room.updates.length) {
				socket.emit('pushUpdateResponse', false);
			} else {
				for (let update of codeUpdates) {
					let changes = ChangeSet.fromJSON(update.changes)
					room.updates.push({changes, clientID: update.clientID})
          room.code = changes.apply(room.code)
				}
				socket.emit('pushUpdateResponse', true);
				while (room.pending.length) room.pending.pop()!(room.updates)
			}
		} catch (error) {
			console.error(error)
		}
	})

  socket.on('pullUpdates', (roomId:string, version: number) => {
    /**
     * Client is requesting updates starting from `version`
     * 
     * If the client is behind, send updates starting from client's version
     * Else, there are no new updates. Callback fn is stored in the pending array
     * - Callback fn is called in pushUpdateHandler
     */
    initRoom(roomId)
    const room = roomData[roomId]
		if (version < room.updates.length) {
			socket.emit("pullUpdateResponse", JSON.stringify(room.updates.slice(version)))
		} else {
			room.pending.push((updates) => { socket.emit('pullUpdateResponse', JSON.stringify(room.updates.slice(version))) });
		}
	})

  // socket.on("disconnect", () => {
  //   log(`User disconnected`);
  //   socket.emit("userDisconnected");
  // })
})

export default wsServer;