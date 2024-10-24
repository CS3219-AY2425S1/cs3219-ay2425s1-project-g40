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

const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379
const REDIS_HOST = process.env.REDIS_HOST || "localhost"

/**
 * Websocket server
 */

const pubClient = new Redis(REDIS_PORT, REDIS_HOST)
pubClient.on("error", (err) => {
  console.log("🛑 Something went wrong with Redis. Exiting....")
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
 * - Different docs from different rooms?
 */
let updates: Update[] = []
let code = Text.of([`print("Hello world!")`])

/**
 * Stores callback functions that is executed when new updates are available
 * - Updated in pullUpdates
 * - Called in pushUpdates
 */
let pending: ((value: any) => void)[] = []

ws.on("connection", (socket) => {
  console.log(`User connected! ${socket.id}`)

  socket.on("getDocument", () => {
    console.log("Received getDocument...")
		socket.emit("getDocumentResponse", updates.length, code.toString());
	})

	socket.on('pushUpdates', (version, codeUpdates) => {
    console.log("Received pushUpdate...")
		codeUpdates = JSON.parse(codeUpdates);
		try {
			if (version != updates.length) {
				socket.emit('pushUpdateResponse', false);
			} else {
				for (let update of codeUpdates) {
					let changes = ChangeSet.fromJSON(update.changes)
					updates.push({changes, clientID: update.clientID})
					console.log("Applying changes...", updates.length)
          code = changes.apply(code)
				}
				socket.emit('pushUpdateResponse', true);
				while (pending.length) pending.pop()!(updates)
			}
		} catch (error) {
			console.error(error)
		}
	})

  socket.on('pullUpdates', (version: number) => {
    /**
     * Client is requesting updates starting from `version`
     * 
     * If the client is behind, send updates starting from client's version
     * Else, there are no new updates. Callback fn is stored in the pending array
     * - Callback fn is called in pushUpdateHandler
     */
    console.log("Received pullUpdate", version, updates.length)
		if (version < updates.length) {
			socket.emit("pullUpdateResponse", JSON.stringify(updates.slice(version)))
		} else {
			pending.push((updates) => { socket.emit('pullUpdateResponse', JSON.stringify(updates.slice(version))) });
		}
	})
})

export default wsServer;