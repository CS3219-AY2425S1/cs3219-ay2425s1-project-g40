"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const server_1 = __importDefault(require("./server"));
const wsServer = http_1.default.createServer(server_1.default);
const ws = new socket_io_1.Server(wsServer);
exports.default = ws;
