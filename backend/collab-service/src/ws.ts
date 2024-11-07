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

type RoomState = {
  users: Set<string>;
  updates: Update[];
  code: Text;
}

const EXPIRE_TIME = 5 * 60 * 60; // 5 hours in seconds
/**
 * Stores callback functions that is executed when new updates are available
 * - Updated in pullUpdates
 * - Called in pushUpdates
 */
const pendingCallback: Record<string,((value: any) => void)[]> = {};


const saveRoomState = async (roomId: string, roomData: RoomState) => {
  const { users, updates, code } = roomData;
  const roomDataJSON = JSON.stringify({
    users: Array.from(users),
    updates: updates.map(update => ({changes: update.changes.toJSON(), clientID: update.clientID })),
    code: code.toJSON(),
  })

  await pubClient.setex(`roomData:${roomId}`, EXPIRE_TIME, roomDataJSON);
}

const getRoomState = async (roomId: string): Promise<RoomState | null> => {
  const roomDataJSON = await pubClient.get(`roomData:${roomId}`);
  if (roomDataJSON) {
    const { users, updates, code} = JSON.parse(roomDataJSON);
    return {
      users: new Set(users),
      updates: updates.map((update: { changes: any; clientID: any; }) => ({changes: ChangeSet.fromJSON(update.changes), clientID: update.clientID})),
      code: Text.of(code),
    }
  }
  return null;
}

const initRoom = async (roomId: string): Promise<RoomState> => {
  let roomState = await getRoomState(roomId);

  if (!roomState) {
    roomState = {
      users: new Set(),
      updates: [],
      code: Text.of([`print("Hello room ${roomId}")`]),
    }
  }
  await saveRoomState(roomId, roomState);

  if (!pendingCallback[roomId]) {
    pendingCallback[roomId] = [];
  }

  return roomState;
}

ws.of("/").adapter.on("leave-room", (room: string, id: string) => {
  log(`User disconnected!`)
  ws.to(room).emit("userDisconnected");
});

ws.on("connection", (socket) => {
  socket.on("joinRoom", async (roomId: string, userId: string) => {
    socket.join(roomId);
    log(`${userId} joined room: ${roomId}`);
  
    const room = await initRoom(roomId);
    room.users.add(userId);
    await saveRoomState(roomId, room);

    if (room.users.size === 2) {
      socket.nsp.to(roomId).emit("joinedRoom", userId); // notify all users that there are 2 users, session can start
    }
  })

  socket.on("getDocument", async (roomId: string) => {
    const room = await initRoom(roomId);
		socket.emit("getDocumentResponse", room.updates.length, room.code.toString());
	})

	socket.on('pushUpdates', async (roomId, version, codeUpdates) => {
    const room = await initRoom(roomId);
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
        await saveRoomState(roomId, room);

				socket.emit('pushUpdateResponse', true);

        const pending = pendingCallback[roomId];
				while (pending && pending.length) pending.pop()!(room.updates)
			}
		} catch (error) {
			console.error(error)
		}
	})

  socket.on('pullUpdates', async (roomId:string, version: number) => {
    /**
     * Client is requesting updates starting from `version`
     * 
     * If the client is behind, send updates starting from client's version
     * Else, there are no new updates. Callback fn is stored in the pending array
     * - Callback fn is called in pushUpdateHandler
     */
    const room = await initRoom(roomId)

		if (version < room.updates.length) {
			socket.emit("pullUpdateResponse", JSON.stringify(room.updates.slice(version)))
		} else {
      if (!pendingCallback[roomId]) pendingCallback[roomId] = [];
			pendingCallback[roomId].push((updates) => { socket.emit('pullUpdateResponse', JSON.stringify(room.updates.slice(version))) });
		}
	})
})

export default wsServer;