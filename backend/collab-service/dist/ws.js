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
const subClient = pubClient.duplicate();
const wsServer = http_1.default.createServer();
const ws = new socket_io_1.Server(wsServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    adapter: (0, redis_adapter_1.createAdapter)(pubClient, subClient)
});
/**
 * TODO
 *
 * - Different docs from different rooms?
 */
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
    socket.on("getDocument", () => {
        console.log("Received getDocument...");
        socket.emit("getDocumentResponse", updates.length, code.toString());
    });
    socket.on('pushUpdates', (version, codeUpdates) => {
        console.log("Received pushUpdate...");
        codeUpdates = JSON.parse(codeUpdates);
        try {
            if (version != updates.length) {
                socket.emit('pushUpdateResponse', false);
            }
            else {
                for (let update of codeUpdates) {
                    let changes = state_1.ChangeSet.fromJSON(update.changes);
                    updates.push({ changes, clientID: update.clientID });
                    console.log("Applying changes...", updates.length);
                    code = changes.apply(code);
                }
                socket.emit('pushUpdateResponse', true);
                while (pending.length)
                    pending.pop()(updates);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
    socket.on('pullUpdates', (version) => {
        /**
         * Client is requesting updates starting from `version`
         *
         * If the client is behind, send updates starting from client's version
         * Else, there are no new updates. Callback fn is stored in the pending array
         * - Callback fn is called in pushUpdateHandler
         */
        console.log("Received pullUpdate", version, updates.length);
        if (version < updates.length) {
            socket.emit("pullUpdateResponse", JSON.stringify(updates.slice(version)));
        }
        else {
            pending.push((updates) => { socket.emit('pullUpdateResponse', JSON.stringify(updates.slice(version))); });
        }
    });
});
exports.default = wsServer;
