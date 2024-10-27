"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("@codemirror/state");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const http_1 = __importDefault(require("http"));
const ioredis_1 = require("ioredis");
const socket_io_1 = require("socket.io");
const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
/**
 * Websocket server
 */
const pubClient = new ioredis_1.Redis(REDIS_PORT, REDIS_HOST);
pubClient.on("error", (err) => {
    console.log("🛑 Something went wrong with Redis. Exiting....");
    process.exit();
});
const subClient = pubClient.duplicate();
const wsServer = http_1.default.createServer();
const ws = new socket_io_1.Server(wsServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    adapter: (0, redis_adapter_1.createAdapter)(pubClient, subClient)
});
const roomData = {};
const initRoom = (roomId) => {
    if (!roomData[roomId]) {
        roomData[roomId] = {
            updates: [],
            code: state_1.Text.of([`print("Hello room ${roomId})`]),
            pending: []
        };
    }
};
let updates = [];
let code = state_1.Text.of([`print("Hello world!")`]);
/**
 * Stores callback functions that is executed when new updates are available
 * - Updated in pullUpdates
 * - Called in pushUpdates
 */
let pending = [];
ws.on("connection", (socket) => {
    console.log(`User connected! ${socket.id}`);
    socket.on("joinRoom", (roomId, userId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined ${roomId}`);
        initRoom(roomId);
        socket.to(roomId).emit("joinedRoom", userId); // notify all that userId joined roomId
    });
    socket.on("getDocument", (roomId) => {
        initRoom(roomId);
        const room = roomData[roomId];
        console.log("Received getDocument...");
        socket.emit("getDocumentResponse", room.updates.length, room.code.toString());
    });
    socket.on('pushUpdates', (roomId, version, codeUpdates) => {
        initRoom(roomId);
        const room = roomData[roomId];
        console.log("Received pushUpdate...");
        codeUpdates = JSON.parse(codeUpdates);
        try {
            if (version != room.updates.length) {
                socket.emit('pushUpdateResponse', false);
            }
            else {
                for (let update of codeUpdates) {
                    let changes = state_1.ChangeSet.fromJSON(update.changes);
                    room.updates.push({ changes, clientID: update.clientID });
                    console.log("Applying changes...", room.updates.length);
                    room.code = changes.apply(room.code);
                }
                socket.emit('pushUpdateResponse', true);
                while (room.pending.length)
                    room.pending.pop()(room.updates);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
    socket.on('pullUpdates', (roomId, version) => {
        /**
         * Client is requesting updates starting from `version`
         *
         * If the client is behind, send updates starting from client's version
         * Else, there are no new updates. Callback fn is stored in the pending array
         * - Callback fn is called in pushUpdateHandler
         */
        initRoom(roomId);
        const room = roomData[roomId];
        console.log("Received pullUpdate", version, room.updates.length);
        if (version < room.updates.length) {
            socket.emit("pullUpdateResponse", JSON.stringify(room.updates.slice(version)));
        }
        else {
            room.pending.push((updates) => { socket.emit('pullUpdateResponse', JSON.stringify(room.updates.slice(version))); });
        }
    });
    socket.on("disconnecting", () => {
        console.log(`User ${socket.id} is disconnecting from rooms: ${Array.from(socket.rooms)}`);
    });
});
exports.default = wsServer;
