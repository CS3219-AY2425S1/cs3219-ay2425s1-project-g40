"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const corsHandler_1 = __importDefault(require("@/middleware/corsHandler"));
const errorHandler_1 = __importDefault(require("@/middleware/errorHandler"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const wsServer_1 = __importDefault(require("./wsServer"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.options("*", (0, cors_1.default)());
app.use(corsHandler_1.default);
app.get("/", (req, res, next) => {
    res.json({
        message: "Hello from collab-service!"
    });
});
// Error handling
app.use((0, errorHandler_1.default)());
/**
 * Websocket server
 */
wsServer_1.default.on("connection", (socket) => {
    console.log(`Connected! ${socket.id}`);
});
exports.default = app;
